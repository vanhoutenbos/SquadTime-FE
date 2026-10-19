// Invite link generation and copying utilities

export async function generateAndCopyInvite(): Promise<boolean> {
  try {
    // Generate invite token
    const response = await fetch('/api/invites/create', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('Failed to create invite');
      return false;
    }

    const { token } = await response.json();
    const inviteLink = `${window.location.origin}/invite/${token}`;
    const inviteMessage = `Hey! Join me on SquadTime to coordinate gaming times across time zones. ${inviteLink}`;

    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(inviteMessage);
      return true;
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = inviteMessage;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  } catch (error) {
    console.error('Error generating invite:', error);
    return false;
  }
}

export async function generateAndCopyInviteForFriend(friendName: string): Promise<boolean> {
  try {
    const response = await fetch('/api/invites/create', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('Failed to create invite');
      return false;
    }

    const { token } = await response.json();
    const inviteLink = `${window.location.origin}/invite/${token}`;
    const inviteMessage = `Hey ${friendName}! Join me on SquadTime to coordinate gaming times. ${inviteLink}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(inviteMessage);
      return true;
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = inviteMessage;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  } catch (error) {
    console.error('Error generating invite:', error);
    return false;
  }
}

export async function acceptInvite(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/invites/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.error || 'Failed to accept invite' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error accepting invite:', error);
    return { success: false, error: 'Network error' };
  }
}
