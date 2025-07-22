
const Toast = ({ message, className }) => {
  return (
    <div className={`rounded-lg px-6 py-3 shadow-lg font-semibold ${className}`}>
      {message}
    </div>
  );
};

export default Toast;