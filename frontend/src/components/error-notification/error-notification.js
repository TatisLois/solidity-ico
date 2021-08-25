import './error-notification.css';

export default function ErrorNotification(props) {
  const inError = props?.inError;
  const message = props?.inErrorMessage || 'ooops something went wrong with your transaction';
  const setInError = props?.setInError;
  const setInErrorMessage = props?.setInErrorMessage;
  const className = inError ? 'error-notification show' : 'error-notification'

  const dismiss = () => {
    setInError(false);
    setInErrorMessage('');
  }

  return (
    <div className={className}>{message} <button onClick={dismiss}>X</button></div>
  )
}
