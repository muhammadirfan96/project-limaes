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
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900 bg-opacity-50">
          <div className="relative w-[95%] max-w-md rounded-lg bg-white p-4 shadow-lg shadow-teal-100">
            {/* Header */}
            <p className="mb-3 border-b border-teal-700 pb-1 text-center text-sm font-semibold text-teal-700">
              Confirmation
            </p>

            {/* Message */}
            <p className="mb-4 text-center text-sm text-slate-700">
              {confirmation.message}
            </p>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => dispatch(setConfirmation(false))}
                className="rounded-md bg-red-600 px-4 py-1 text-sm text-white hover:bg-red-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmation.handleOke();
                  dispatch(setConfirmation(false));
                }}
                className="rounded-md bg-green-600 px-4 py-1 text-sm text-white hover:bg-green-700"
              >
                OK
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
          className={`${notification.background} fixed right-4 top-4 z-20 rounded-md px-4 py-2 shadow-lg transition-transform duration-300`}
        >
          <p className="text-center text-sm font-medium">
            {notification.message}
          </p>
        </div>
      )}
    </>
  );
};

export { Confirmation, Notification };
