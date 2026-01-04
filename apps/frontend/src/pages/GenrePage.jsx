import { createResource, createSignal, Show } from "solid-js";
import RecordGrid from "../components/RecordGrid";
import { fetchRecords } from "../lib/records";

export default function GenrePage(props) {
  const [page, setPage] = createSignal(1);
  
  const [data] = createResource(
    () => ({
      page: page(),
      genre: props.params.genre,
    }),
    fetchRecords
  );

  return (
    <div>
      <Show when={!data.loading} fallback={<div>Loading...</div>}>
        <RecordGrid
          records={data()?.items}
          meta={data()?.meta}
          page={page()}
          onPageChange={setPage}
        />
      </Show>
    </div>
  );
}
