import React, { useState } from "react";
import { Row, Table, Radio } from "antd";
import { Correlation, Field } from "../../types";
import MapGL, { Marker } from "react-map-gl";
import { RadioChangeEvent } from "antd/lib/radio";
const labResultsColumns = [
  {
    title: "Property",
    dataIndex: "property",
    key: "property",
  },
  {
    title: "Ultrasound",
    dataIndex: "ultrasound",
    key: "ultrasound",
  },
  {
    title: "Maceration",
    dataIndex: "maceration",
    key: "maceration",
  },
];

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiOTNkZWdyZWUiLCJhIjoiY2s5MHo5b3JxMDY5bzNmcGRsNmEyZGUwMyJ9.8jcXoNEjHqd9A2DI7LS6Zg";

const ICON = `M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
  c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
  C20.1,15.8,20.2,15.8,20.2,15.7z`;

const SIZE = 20;

const PIN = (
  <svg
    height={SIZE}
    viewBox="0 0 24 24"
    style={{
      cursor: "pointer",
      fill: "#001529",
      stroke: "none",
      transform: `translate(${-SIZE / 2}px,${-SIZE}px)`,
    }}
  >
    <path d={ICON} />
  </svg>
);

interface props {
  field: Field;
  correlation: Correlation | null;
  labProperty: string | null;
  labPropertyFull: string | null;
  labOrigin: string | null;
}

export const DrawerContent = ({
  field,
  correlation,
  labProperty,
  labPropertyFull,
  labOrigin,
}: props) => {
  const [prevLat, setPrevLat] = useState<number | null>(null);
  const [prevLon, setPrevLon] = useState<number | null>(null);
  const [year, setYear] = useState<string | null>("2019");
  const [viewport, setViewport] = useState({
    latitude: 0,
    longitude: 0,
    zoom: 6,
  });

  if (prevLat !== field.lat || prevLon !== field.lon) {
    setPrevLat(field.lat);
    setPrevLon(field.lon);
    setViewport({
      latitude: field.lat,
      longitude: field.lon,
      zoom: 6,
    });
  }

  const ultrasound_data = field.lab_results.find(
    (r) => r.year === year && r.lab_prop_type === "ultrasound"
  );
  const maceration_data = field.lab_results.find(
    (r) => r.year === year && r.lab_prop_type === "maceration"
  );
  const labResultsData = ultrasound_data?.results
    .map((r) => r.property)
    .map((p) => {
      let ultrasound = ultrasound_data?.results.find((r) => r.property === p)
        ?.value;
      if (Number(ultrasound)) ultrasound = Number(ultrasound).toFixed(2);

      let maceration = maceration_data?.results.find((r) => r.property === p)
        ?.value;
      if (Number(maceration)) maceration = Number(maceration).toFixed(2);

      return {
        property: p,
        ultrasound: ultrasound ? ultrasound : "NA",
        maceration: maceration ? maceration : "NA",
      };
    });

  const handleYearChange = (event: RadioChangeEvent) => {
    setYear(event.target.value);
  };

  let drawerCorrelation = null;
  if (correlation && labProperty) {
    let correlationColumns = field.satellite_results.map((r) => ({
      title: r.year,
      dataIndex: r.year,
      key: r.year,
    }));
    correlationColumns.unshift({
      title: " ",
      dataIndex: "variable",
      key: "variable",
    });

    const satelliteSource = field.satellite_results.reduce(
      (o, sr) => {
        let sat_value = sr.results.find(
          (r) =>
            r.sat_prop === correlation?.sat_prop &&
            r.agg_time === correlation?.agg_time &&
            r.agg_value === correlation?.agg_value &&
            r.sat_source === correlation?.sat_source
        )?.value;

        return {
          ...o,
          [sr.year]: sat_value?.toFixed(2),
        };
      },
      {
        variable: `${correlation.sat_prop} (${correlation.agg_value}) until ${correlation.agg_time}`,
      }
    );

    const labSource = field.lab_results
      .filter((r) => r.lab_prop_type === labOrigin)
      .reduce(
        (o, lr) => {
          let lab_value = lr.results.find((r) => r.property === labPropertyFull)
            ?.value;
          if (Number(lab_value)) lab_value = Number(lab_value).toFixed(2);

          return {
            ...o,
            [lr.year]: lab_value,
          };
        },
        {
          variable: `${labOrigin} - ${labProperty}`,
        }
      );

    const correlationSource = [satelliteSource, labSource];
    drawerCorrelation = (
      <>
        <Row>
          <h3>{`${labPropertyFull} & ${correlation.sat_prop} (${correlation.agg_value}) until ${correlation.agg_time}`}</h3>
        </Row>
        <Row>
          <p>{`Correlation: ${correlation.value.toFixed(2)}`}</p>
        </Row>
        <Row>
          <Table
            size="small"
            pagination={false}
            dataSource={correlationSource}
            columns={correlationColumns}
          />
          ;
        </Row>
      </>
    );
  }

  const years = field.lab_results
    .filter((r) => r.lab_prop_type === "ultrasound")
    .map((r) => r.year);

  return (
    <>
      <h2>
        {field.Vineyard} ({field.Variety})
      </h2>
      <Row>
        <MapGL
          {...viewport}
          width="100%"
          height="300px"
          mapStyle="mapbox://styles/mapbox/light-v10"
          onViewportChange={setViewport}
          mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
        >
          <Marker
            longitude={Number(field.lon)}
            latitude={Number(field.lat)}
            key={`marker-${field["geocledian_Parcel ID"]}`}
          >
            {PIN}
          </Marker>
        </MapGL>
      </Row>
      <Row>
        <p>
          {field.City} - {field.Region}
        </p>
      </Row>
      {drawerCorrelation}
      <Row>
        <h3>Laboratory Results</h3>
      </Row>
      <Row>
        <Radio.Group defaultValue={year} onChange={handleYearChange}>
          {years.map((year) => (
            <Radio.Button value={year}>{year}</Radio.Button>
          ))}
        </Radio.Group>
      </Row>
      <Row>
        <Table
          pagination={false}
          size="small"
          dataSource={labResultsData}
          columns={labResultsColumns}
        />
        ;
      </Row>
    </>
  );
};
