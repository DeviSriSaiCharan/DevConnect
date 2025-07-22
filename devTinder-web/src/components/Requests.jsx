import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequest } from "../utils/requestSlice";
import { useEffect } from "react";

const Requests = () => {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();

  const reviewRequest = async (status, _id) => {
    try {
      await axios.post(
        import.meta.env.VITE_BASE_URL + "/review/" + status + "/" + _id,
        {},
        { withCredentials: true }
      );
      dispatch(removeRequest(_id));
    } catch (err) {
      console.error("Failed to update request status", err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_BASE_URL + "/user/requests/received", {
        withCredentials: true,
      });
      dispatch(addRequests(res.data.data));
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (!requests) return null;

  if (requests.length === 0)
    return <h1 className="flex justify-center my-10 text-xl font-semibold">No Requests Found</h1>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-6 text-center">Connection Requests</h1>

      <div className="space-y-4">
        {requests.map((request) => {
          const { _id, firstName, lastName, photoURL, age, gender, about } = request.fromUserId;

          return (
            <div
              key={_id}
              className="flex items-center justify-between bg-base-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <img
                  alt="photo"
                  className="w-14 h-14 rounded-full object-cover border border-base-300"
                  src={photoURL}
                />
                <div>
                  <h2 className="text-lg font-semibold">{firstName} {lastName}</h2>
                  {age && gender && (
                    <p className="text-sm text-gray-600">{age}, {gender}</p>
                  )}
                  {about && <p className="text-sm text-gray-500">{about}</p>}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => reviewRequest("rejected", request._id)}
                >
                  Reject
                </button>
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => reviewRequest("accepted", request._id)}
                >
                  Accept
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Requests;
