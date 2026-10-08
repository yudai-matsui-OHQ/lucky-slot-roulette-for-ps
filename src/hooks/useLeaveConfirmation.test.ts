// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLeaveConfirmation } from './useLeaveConfirmation';

/** beforeunload を発火し、離脱確認が要求されたか (preventDefault されたか) を返す */
function fireBeforeUnload() {
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
}

describe('useLeaveConfirmation', () => {
  it('active=false なら離脱確認を出さない', () => {
    renderHook(() => useLeaveConfirmation(false));
    expect(fireBeforeUnload()).toBe(false);
  });

  it('active=true なら離脱確認を出す', () => {
    const { unmount } = renderHook(() => useLeaveConfirmation(true));
    expect(fireBeforeUnload()).toBe(true);
    unmount();
  });

  it('active が false に戻る (確定済み) と離脱確認を解除する', () => {
    const { rerender } = renderHook(({ active }) => useLeaveConfirmation(active), {
      initialProps: { active: true },
    });
    rerender({ active: false });
    expect(fireBeforeUnload()).toBe(false);
  });

  it('アンマウント時にリスナーを解除する', () => {
    const { unmount } = renderHook(() => useLeaveConfirmation(true));
    unmount();
    expect(fireBeforeUnload()).toBe(false);
  });
});
