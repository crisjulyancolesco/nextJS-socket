// components/MessageTextarea.jsx
const MessageTextarea = ({ apiMessage }) => {
    return (
      <textarea
        placeholder="API response will appear here"
        value={apiMessage}
        readOnly
        rows="5"
        cols="40"
      />
    );
  };
  
  export default MessageTextarea;
  