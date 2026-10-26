// Backdrop dismissal for <dialog>. A long-press on a button opens a dialog while the finger
// is still down, so the release lands on the dialog's backdrop and used to count as a click
// outside it. A click only dismisses when the press that made it also started on the backdrop.

export function bindBackdropDismiss(dialog: HTMLDialogElement | null): void {
  if (!dialog) return;
  let pressStartedOnBackdrop = false;
  dialog.addEventListener("pointerdown", (e) => {
    pressStartedOnBackdrop = e.target === dialog;
  });
  dialog.addEventListener("click", (e) => {
    const dismiss = e.target === dialog && pressStartedOnBackdrop;
    pressStartedOnBackdrop = false;
    if (dismiss) dialog.close();
  });
}
