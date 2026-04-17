import { Injectable } from '@angular/core';

declare const google: any;

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  /** Polls for the GIS script to load, then renders a Google sign-in button. */
  renderButton(
    targetId: string,
    clientId: string,
    onCredential: (idToken: string) => void,
    opts: { theme?: string; size?: string; shape?: string; text?: string } = {}
  ): void {
    const tryInit = () => {
      if (typeof google === 'undefined' || !google?.accounts?.id) return false;

      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => onCredential(response.credential),
        ux_mode: 'popup',
        auto_select: false,
      });

      const el = document.getElementById(targetId);
      if (!el) return false;

      google.accounts.id.renderButton(el, {
        theme: opts.theme ?? 'outline',
        size: opts.size ?? 'large',
        shape: opts.shape ?? 'pill',
        text: opts.text ?? 'continue_with',
        logo_alignment: 'center',
        width: 320,
      });
      return true;
    };

    if (tryInit()) return;
    const handle = setInterval(() => {
      if (tryInit()) clearInterval(handle);
    }, 120);
    setTimeout(() => clearInterval(handle), 8000);
  }
}
