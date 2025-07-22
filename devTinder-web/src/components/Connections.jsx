import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/connectionSlice";
import { Link } from "react-router-dom";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();

  const fetchConnections = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      dispatch(addConnections(res.data.data));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (!connections) return null;

  if (connections.length === 0) return <h1 className="flex justify-center my-10"> No Connections Found</h1>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Connections</h1>

      <div className="space-y-4">
        {connections.map((connection) => {
          const { _id, firstName, lastName, photoURL, age, gender, about } = connection;

          return (
            <div
              key={_id}
              className="flex items-center justify-between p-4 rounded-lg bg-base-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <img
                  alt="photo"
                  className="w-14 h-14 rounded-full object-cover border-2 border-base-300"
                  src={photoURL}
                />
                <div>
                  <h2 className="font-semibold text-lg">{firstName} {lastName}</h2>
                  {age && gender && <p className="text-sm text-gray-600">{age}, {gender}</p>}
                  {about && <p className="text-sm text-gray-500">{about}</p>}
                </div>
              </div>

              <Link to={`/chat/${_id}`}>
                <button className="btn btn-primary btn-sm">Chat</button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Connections;
