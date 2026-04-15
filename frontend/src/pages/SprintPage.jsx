import { useState } from "react";
import SprintList from "@/components/sprint/SprintList";
import SprintAttendance from "@/components/sprint/SprintAttendance";

const SprintPage = () => {
  const [selectedSprint, setSelectedSprint] = useState(null);

  return selectedSprint ? (
    <SprintAttendance
      sprint={selectedSprint}
      onBack={() => setSelectedSprint(null)}
    />
  ) : (
    <SprintList onSelectSprint={setSelectedSprint} />
  );
};

export default SprintPage;
