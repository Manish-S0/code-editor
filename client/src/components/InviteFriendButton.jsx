import { useState } from 'react';

const InviteFriendButton = () => {
  const [buttonText, setButtonText] = useState('Invite Friend');

  const handleCopy = () => {
    // Copy the link to the clipboard (you can replace this with the actual link)
    navigator.clipboard.writeText(window.location.href);
    
    // Change the button text to 'Link Copied'
    setButtonText('Link Copied');

    // Set a timeout to revert the button text back to 'Copy Link' after 2 seconds
    setTimeout(() => {
      setButtonText('Invite Friend');
    }, 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="mt-4 w-full py-2 px-4 bg-blue-600 rounded transition duration-200"
    >
      {buttonText}
    </button>
  );
};

export default InviteFriendButton;