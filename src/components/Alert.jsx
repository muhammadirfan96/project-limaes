import { useDispatch, useSelector } from "react-redux";
import { setNotification } from "../redux/notificationSlice.js";
import { setConfirmation } from "../redux/confirmationSlice.js";

const Confirmation = () => {
  const dispatch = useDispatch();
  const confirmation = useSelector(
    (state) => state.confirmationAlert.confirmation,
  );

  return (
    <>
      {confirmation && (
        <div className="fixed bottom-0 left-0 right-0 top-0 z-20 bg-slate-900 bg-opacity-50">
          <div className="relative mx-auto mt-20 w-[95%] rounded-md bg-white p-2 shadow-md shadow-teal-100 md:w-[80%] lg:w-[50%]">
            <p className="mb-2 border-b border-teal-700 text-center text-xs">
              Confirmation
            </p>
            <p className="mb-2 text-center">{confirmation.message}</p>
            <div className="flex justify-center">
              <button
                onClick={() => dispatch(setConfirmation(false))}
                className="mx-1 rounded bg-red-700 p-1 text-xs text-white"
              >
                calcel
              </button>
              <button
                onClick={() => {
                  confirmation.handleOke();
                  dispatch(setConfirmation(false));
                }}
                className="mx-1 rounded bg-green-700 p-1 text-xs text-white"
              >
                oke
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Notification = () => {
  const dispatch = useDispatch();
  const notification = useSelector(
    (state) => state.notificationAlert.notification,
  );

  if (notification)
    setTimeout(function () {
      dispatch(setNotification(false));
    }, 3000);

  return (
    <>
      {notification && (
        <div
          className={`${notification.background} fixed right-0.5 top-0.5 z-20 mt-1 rounded-md p-1 shadow-md`}
        >
          <p className="text-center text-xs">{notification.message}</p>
        </div>
      )}
    </>
  );
};

export { Confirmation, Notification };
