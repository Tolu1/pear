import { ImSpinner3 } from "react-icons/im";

function Scanning() {
  return (
    <div className="flex h-[200px] items-center justify-center text-center">
      <ImSpinner3 className="animate-spin" size={24} />
    </div>
  );
}

export default Scanning;
