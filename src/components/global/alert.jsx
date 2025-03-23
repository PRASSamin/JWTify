import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProgressNotification = ({ alertInfo }) => {
  useEffect(() => {
    if (alertInfo.isShow) {
      if (alertInfo.type) {
        toast[alertInfo.type](alertInfo.message, {
          position: "bottom-right",
          autoClose: 2000,
          progressClassName: "toast-progress-bar",
          theme: "colored",

        });
      } else {
        toast.info(alertInfo.message, {
          position: "bottom-right",
          autoClose: 2000,
          progressClassName: "toast-progress-bar",
          theme: "colored",
        });
      }
    }
  }, [alertInfo]);

  return <ToastContainer />;
};

export default ProgressNotification;
