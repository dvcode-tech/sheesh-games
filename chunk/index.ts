import { Canister, query, text } from 'azle';
export default Canister({
  _azle_chunk: query([], text, () => {
    return '_azle_chunk';
  }),
});
