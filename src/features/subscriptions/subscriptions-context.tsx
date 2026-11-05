import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { StyleSheet, View } from "react-native";
import { useStorageState } from "@/hooks/use-storage-state";
import {
  readBudget,
  readSubscriptions,
  type Subscription,
  type SubscriptionDraft,
} from "./model";
import { Copy, fonts } from "./ui";

type State = {
  loading: boolean;
  subscriptions: Subscription[];
  save: (items: Subscription[]) => void;
  unread: boolean;
  markRemindersRead: () => void;
  monthlyBudget: number;
  saveBudget: (amount: number) => void;
  draft: SubscriptionDraft | null;
  setDraft: (draft: SubscriptionDraft | null) => void;
  notify: (message: string) => void;
};
const SubscriptionsContext = createContext<State | null>(null);

export function SubscriptionsProvider({ children }: PropsWithChildren) {
  const [[loading, saved], setSaved] = useStorageState(
    "recur-subscriptions-v1",
  );
  const subscriptions = useMemo(() => readSubscriptions(saved), [saved]);
  const [[budgetLoading, savedBudget], setSavedBudget] =
    useStorageState("recur-budget-v1");
  const monthlyBudget = readBudget(savedBudget);
  const [draft, setDraft] = useState<SubscriptionDraft | null>(null);
  const [notice, setNotice] = useState<{ text: string } | null>(null);
  const notify = useCallback((text: string) => setNotice({ text }), []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  const [unread, setUnread] = useState(true);
  const save = useCallback(
    (items: Subscription[]) => setSaved(JSON.stringify(items)),
    [setSaved],
  );
  return (
    <SubscriptionsContext
      value={{
        loading: loading || budgetLoading,
        subscriptions,
        save,
        unread,
        markRemindersRead: () => setUnread(false),
        monthlyBudget,
        saveBudget: (amount) => {
          if (Number.isFinite(amount) && amount > 0)
            setSavedBudget(String(amount));
        },
        draft,
        setDraft,
        notify,
      }}
    >
      <View style={styles.container}>
        {children}
        {notice ? (
          <View pointerEvents="none" style={styles.notice}>
            <Copy
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
              style={styles.noticeText}
            >
              {notice.text}
            </Copy>
          </View>
        ) : null}
      </View>
    </SubscriptionsContext>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  notice: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    maxWidth: "90%",
    borderRadius: 14,
    backgroundColor: "#1c1c1e",
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  noticeText: {
    color: "#ffffff",
    fontFamily: fonts.medium,
    textAlign: "center",
  },
});
export function useSubscriptions() {
  const state = use(SubscriptionsContext);
  if (!state)
    throw new Error("useSubscriptions must be inside SubscriptionsProvider");
  return state;
}
