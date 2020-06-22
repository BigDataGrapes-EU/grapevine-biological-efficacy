interface Query {
  lab_prop_type: string;
  top_k: number;
}

export const server = {
  fetchCorrelations: async <TData = any>(query: Query) => {
    // const url = new URL(
    //   "https://cors-anywhere.herokuapp.com/" +
    //     "http://barbera4.isti.cnr.it:8080/api/v1/correlation/" +
    //     query.lab_prop_type +
    //     "?topk=" +
    //     query.top_k
    // );
    // console.log(url.toString());
    // const res = await fetch(url.toString());

    const res = await fetch(`../../../data/${query.lab_prop_type}.json`);

    return res.json() as Promise<TData>;
  },
  fetchFields: async <TData = any>() => {
    const res = await fetch("../../../data/api_fields.json");

    return res.json() as Promise<TData>;
  },
};
