import RecordGrid from "../components/RecordGrid";

export default function Shop(props) {
  return (
    <div>
      <RecordGrid
        genre={props.params.genre}
        section={props.params.section}
        q={props.location.query.q}
      />
    </div>
  );
}
