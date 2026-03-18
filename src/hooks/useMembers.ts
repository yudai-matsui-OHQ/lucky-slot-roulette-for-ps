import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Member } from '../types';
import { STORAGE_KEYS, AVATAR_COLORS } from '../utils/constants';

export function useMembers() {
  const [members, setMembers] = useLocalStorage<Member[]>(STORAGE_KEYS.members, []);
  const [lastWinnerId, setLastWinnerId] = useLocalStorage<string | null>(
    STORAGE_KEYS.lastWinner,
    null,
  );

  const addMember = useCallback(
    (name: string) => {
      const member: Member = {
        id: crypto.randomUUID(),
        name,
        color: AVATAR_COLORS[members.length % AVATAR_COLORS.length],
      };
      setMembers((prev) => [...prev, member]);
    },
    [members.length, setMembers],
  );

  const removeMember = useCallback(
    (id: string) => {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      if (lastWinnerId === id) setLastWinnerId(null);
    },
    [setMembers, lastWinnerId, setLastWinnerId],
  );

  const updateMember = useCallback(
    (id: string, name: string) => {
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, name } : m)));
    },
    [setMembers],
  );

  const getEligibleMembers = useCallback(
    (excludeLast: boolean) => {
      if (!excludeLast || !lastWinnerId) return members;
      return members.filter((m) => m.id !== lastWinnerId);
    },
    [members, lastWinnerId],
  );

  const lastWinner = members.find((m) => m.id === lastWinnerId) ?? null;

  return {
    members,
    lastWinner,
    lastWinnerId,
    setLastWinnerId,
    addMember,
    removeMember,
    updateMember,
    getEligibleMembers,
  };
}
