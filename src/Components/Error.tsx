import { MdOutlineErrorOutline } from "react-icons/md";

function Error({ message, className }: { message: string, className?: string }) {
  return (
    <div role="alert" className={`alert alert-error alert-dash w-full ${className}`}>
      <MdOutlineErrorOutline className="text-red-500" />
      <span className="text-red-500">{message}</span>
    </div>
  );
}

export default Error;
