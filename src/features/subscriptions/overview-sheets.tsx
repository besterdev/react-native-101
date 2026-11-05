import {
  useEffect,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotionPressable } from "./motion";
import { ChoiceField } from "./choice-field";
import { DateField } from "./date-field";
import {
  CATEGORIES,
  DEMO_DATE,
  isValidDate,
  money,
  type BillingCycle,
  type Category,
  type Subscription,
  type SubscriptionDraft,
} from "./model";
import { ServiceIcon, SubscriptionRow } from "./subscription-row";
import {
  CircleButton,
  colors,
  Copy,
  FactRow,
  fonts,
  PrimaryButton,
} from "./ui";

function dismissKeyboard() {
  Keyboard.dismiss();
}

type Dismiss = (after?: () => void) => void;

export function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode | ((dismiss: Dismiss) => ReactNode);
}) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const progress = useSharedValue(0);
  const closing = useSharedValue(false);
  const dragY = useSharedValue(0);
  const sheetHeight = useSharedValue(height);
  const dragDismissed = useSharedValue(false);
  const [isClosing, setIsClosing] = useState(false);
  const backdropStyle = useAnimatedStyle(() => ({
    opacity:
      progress.get() *
      (1 - Math.min(dragY.get() / Math.max(sheetHeight.get(), 1), 0.7)),
  }));
  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.get()) * height + dragY.get() }],
  }));
  useEffect(
    () => () => {
      cancelAnimation(progress);
      cancelAnimation(dragY);
    },
    [progress, dragY],
  );

  function dismiss(after = onClose) {
    if (closing.get()) return;
    closing.set(true);
    setIsClosing(true);
    Keyboard.dismiss();
    progress.set(
      withTiming(
        0,
        {
          duration: 220,
          easing: Easing.in(Easing.cubic),
          reduceMotion: ReduceMotion.System,
        },
        (finished) => {
          if (finished) scheduleOnRN(after);
        },
      ),
    );
  }

  // Limit the pan to the grabber/header so form fields and list scrolling keep
  // their native gestures. The modal gets its own gesture root on Android.
  const pan = Gesture.Pan()
    .enabled(!isClosing)
    .activeOffsetY(8)
    .failOffsetX([-24, 24])
    .onStart(() => {
      if (closing.get()) return;
      cancelAnimation(dragY);
      dragDismissed.set(false);
      scheduleOnRN(dismissKeyboard);
    })
    .onUpdate((event) => {
      if (!closing.get()) dragY.set(Math.max(0, event.translationY));
    })
    .onEnd((event) => {
      if (closing.get()) return;
      const distance = Math.max(0, event.translationY);
      if (
        distance > Math.min(120, sheetHeight.get() * 0.25) ||
        (distance > 24 && event.velocityY > 1000)
      ) {
        dragDismissed.set(true);
        scheduleOnRN(dismiss);
      }
    })
    .onFinalize(() => {
      if (!closing.get() && !dragDismissed.get()) {
        dragY.set(
          withSpring(0, {
            damping: 24,
            stiffness: 280,
            overshootClamping: true,
            reduceMotion: ReduceMotion.System,
          }),
        );
      }
    });

  return (
    <Modal
      transparent
      animationType="none"
      visible
      onRequestClose={() => dismiss()}
      statusBarTranslucent
      onShow={() => {
        if (!closing.get())
          progress.set(
            withTiming(1, {
              duration: 320,
              easing: Easing.out(Easing.cubic),
              reduceMotion: ReduceMotion.System,
            }),
          );
      }}
    >
      <GestureHandlerRootView style={styles.gestureRoot}>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Animated.View
            style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss sheet"
              onPress={() => dismiss()}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
          <Animated.View
            testID="sheet-panel"
            onLayout={(event) =>
              sheetHeight.set(event.nativeEvent.layout.height)
            }
            accessibilityViewIsModal
            pointerEvents={isClosing ? "none" : "auto"}
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 20), maxHeight: "92%" },
              panelStyle,
            ]}
          >
            <GestureDetector gesture={pan} touchAction="none">
              <View
                collapsable={false}
                testID="sheet-drag-area"
                style={styles.dragArea}
              >
                <View style={styles.handle} />
                <View style={styles.heading}>
                  <Copy accessibilityRole="header" style={styles.title}>
                    {title}
                  </Copy>
                  <CircleButton
                    label="Close sheet"
                    icon="close"
                    onPress={() => dismiss()}
                    style={styles.close}
                  />
                </View>
              </View>
            </GestureDetector>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
            >
              {typeof children === "function" ? children(dismiss) : children}
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}
export function AddSubscriptionSheet({
  onClose,
  onAdd,
  initialDate = "2026-10-24",
  item,
  draft,
  onDraftChange,
  onDiscardDraft,
}: {
  onClose: () => void;
  onAdd: (item: Subscription) => void;
  initialDate?: string;
  item?: Subscription;
  draft?: SubscriptionDraft | null;
  onDraftChange?: (draft: SubscriptionDraft) => void;
  onDiscardDraft?: () => void;
}) {
  const [form, setForm] = useState<SubscriptionDraft>(() =>
    item
      ? {
          name: item.name,
          amount: String(item.price),
          cycle: item.cycle,
          date: item.date,
          category: item.category,
        }
      : (draft ?? {
          name: "",
          amount: "",
          cycle: "monthly",
          date: initialDate,
          category: "Entertainment",
        }),
  );
  const [restored] = useState(!item && !!draft);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const { name, amount, cycle, date, category } = form;
  function update(patch: Partial<SubscriptionDraft>) {
    const next = { ...form, ...patch };
    setForm(next);
    setError("");
    if (!item) onDraftChange?.(next);
  }
  const [error, setError] = useState("");
  function submit(dismiss: Dismiss) {
    const price = Number(amount.replace(/,/g, ""));
    if (!name.trim()) return setError("Enter a service name.");
    if (!Number.isFinite(price) || price <= 0)
      return setError("Enter an amount greater than ฿0.");
    if (!isValidDate(date) || (!item && date < DEMO_DATE))
      return setError(
        "Choose a valid payment date on or after 16 October 2026.",
      );
    dismiss(() =>
      onAdd({
        id:
          item?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: name.trim(),
        plan:
          item && item.cycle === cycle
            ? item.plan
            : `${cycle === "monthly" ? "Monthly" : "Yearly"} plan`,
        price,
        cycle,
        date,
        category,
        brand: item?.brand ?? "custom",
        active: item?.active ?? true,
      }),
    );
  }
  return (
    <Sheet
      title={item ? "Edit subscription" : "New subscription"}
      onClose={onClose}
    >
      {(dismiss) => (
        <>
          <Copy style={styles.description}>
            {restored
              ? "Draft restored. Continue where you left off."
              : item
                ? "Update your recurring payment details."
                : "Keep track of your next recurring payment."}
          </Copy>
          <Field label="Service name">
            <TextInput
              accessibilityLabel="Service name"
              placeholder="e.g. Apple Music"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={(name) => update({ name })}
              maxLength={60}
              style={styles.input}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </Field>
          <View style={styles.fieldRow}>
            <View style={styles.column}>
              <Field label="Amount (THB)">
                <TextInput
                  accessibilityLabel="Amount in Thai baht"
                  value={amount}
                  onChangeText={(amount) => update({ amount })}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                  maxLength={12}
                  style={styles.input}
                />
              </Field>
            </View>
            <View style={styles.column}>
              <Field label="Billing cycle">
                <ChoiceField
                  label="Billing cycle"
                  value={cycle}
                  onChange={(value) => update({ cycle: value as BillingCycle })}
                  options={[
                    { value: "monthly", label: "Monthly" },
                    { value: "yearly", label: "Yearly" },
                  ]}
                />
              </Field>
            </View>
          </View>
          <Field label="Next payment">
            <DateField value={date} onChange={(date) => update({ date })} />
          </Field>
          <Field label="Category">
            <ChoiceField
              label="Category"
              value={category}
              onChange={(value) => update({ category: value as Category })}
              options={CATEGORIES.map((value) => ({ value, label: value }))}
            />
          </Field>
          {error ? (
            <Copy
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
              style={styles.error}
            >
              {error}
            </Copy>
          ) : null}
          <View style={styles.action}>
            <PrimaryButton
              title={item ? "Save changes" : "Add subscription"}
              plus={!item}
              onPress={() => submit(dismiss)}
            />
          </View>
          {item ? (
            <TextButton title="Cancel" onPress={() => dismiss()} />
          ) : (
            <>
              <Copy style={styles.draftNote}>
                Your draft stays available while the app is open.
              </Copy>
              <TextButton
                title="Save draft & close"
                onPress={() => dismiss()}
              />
              {draft && onDiscardDraft ? (
                confirmDiscard ? (
                  <View style={styles.confirm}>
                    <Copy>Discard this unfinished subscription?</Copy>
                    <TextButton
                      title="Confirm discard"
                      destructive
                      onPress={() => dismiss(onDiscardDraft)}
                    />
                    <TextButton
                      title="Keep editing"
                      onPress={() => setConfirmDiscard(false)}
                    />
                  </View>
                ) : (
                  <TextButton
                    title="Discard draft"
                    destructive
                    onPress={() => setConfirmDiscard(true)}
                  />
                )
              ) : null}
            </>
          )}
        </>
      )}
    </Sheet>
  );
}
function Field({ label, children }: PropsWithChildren<{ label: string }>) {
  return (
    <View style={styles.field}>
      <Copy style={styles.label}>{label}</Copy>
      {children}
    </View>
  );
}
export function SettingsSheet({
  session,
  onClose,
  onReset,
  onSignOut,
  monthlyBudget,
  onEditBudget,
}: {
  session?: string | null;
  onClose: () => void;
  onReset: () => void;
  onSignOut: () => void;
  monthlyBudget: number;
  onEditBudget: () => void;
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  return (
    <Sheet title="Settings" onClose={onClose}>
      {(dismiss) => (
        <>
          <View style={styles.profile}>
            <View style={styles.avatar}>
              <Copy style={styles.initials}>MC</Copy>
            </View>
            <Copy style={styles.profileName}>Mac</Copy>
            <Copy style={styles.description}>
              {session === "demo@recur.app"
                ? "Demo account"
                : session || "Demo account"}
            </Copy>
          </View>
          <View style={styles.card}>
            <FactRow label="Currency" value="Thai Baht (฿)" />
            <View style={styles.divider} />
            <MotionPressable
              accessibilityRole="button"
              accessibilityLabel="Edit monthly budget"
              onPress={() => dismiss(onEditBudget)}
            >
              <FactRow
                label="Monthly budget"
                value={`฿${money(monthlyBudget)} ›`}
              />
            </MotionPressable>
          </View>
          <Copy style={styles.note}>
            Your sample subscriptions are saved on this device. This demo uses
            16 October 2026 as its reference date.
          </Copy>
          {confirmReset ? (
            <View style={styles.confirm}>
              <Copy>
                Restore the six sample subscriptions and the ฿2,000 budget? Your
                unfinished draft will also be cleared.
              </Copy>
              <PrimaryButton
                title="Confirm reset"
                onPress={() => dismiss(onReset)}
              />
              <TextButton
                title="Keep my changes"
                onPress={() => setConfirmReset(false)}
              />
            </View>
          ) : (
            <PrimaryButton
              title="Reset sample data"
              onPress={() => setConfirmReset(true)}
            />
          )}
          <TextButton
            title="Back to sign in"
            onPress={() => dismiss(onSignOut)}
            destructive
          />
        </>
      )}
    </Sheet>
  );
}
export function SubscriptionListSheet({
  title,
  items,
  onClose,
  onSelect,
}: {
  title: string;
  items: Subscription[];
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <Sheet title={title} onClose={onClose}>
      <Copy style={styles.description}>
        {title === "Payment reminders"
          ? "Upcoming payments in your sample calendar. Reminders are shown here in the app."
          : `${items.length} ${items.length === 1 ? "subscription" : "subscriptions"} saved on this device.`}
      </Copy>
      <View style={[styles.card, styles.list]}>
        {items.map((item, index) => (
          <SubscriptionRow
            key={item.id}
            item={item}
            last={index === items.length - 1}
            onPress={() => onSelect(item.id)}
          />
        ))}
        {!items.length ? (
          <Copy style={styles.empty}>No subscriptions in this list.</Copy>
        ) : null}
      </View>
    </Sheet>
  );
}
export function SubscriptionDetailSheet({
  item,
  onClose,
  onChange,
  onRemove,
  onEdit,
  occurrenceDate,
}: {
  item: Subscription;
  onClose: () => void;
  onChange: (item: Subscription) => void;
  onRemove: () => void;
  onEdit: () => void;
  occurrenceDate?: string;
}) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  return (
    <Sheet title="Subscription details" onClose={onClose}>
      {(dismiss) => (
        <>
          <View style={styles.profile}>
            <ServiceIcon item={item} />
            <Copy style={styles.profileName}>{item.name}</Copy>
            <Copy style={styles.description}>{item.plan}</Copy>
          </View>
          <View style={styles.card}>
            <FactRow
              label="Amount"
              value={`฿${money(item.price)} / ${item.cycle === "monthly" ? "month" : "year"}`}
            />
            <View style={styles.divider} />
            {occurrenceDate ? (
              <>
                <FactRow
                  label="Selected payment"
                  value={new Date(
                    occurrenceDate + "T12:00:00",
                  ).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                />
                <View style={styles.divider} />
              </>
            ) : null}
            <FactRow
              label="Next payment"
              value={new Date(item.date + "T12:00:00").toLocaleDateString(
                "en-GB",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                },
              )}
            />
            <View style={styles.divider} />
            <FactRow label="Category" value={item.category} />
            <View style={styles.divider} />
            <View style={styles.switchRow}>
              <Copy>Track subscription</Copy>
              <Switch
                accessibilityLabel="Track subscription"
                value={item.active}
                onValueChange={(active) => onChange({ ...item, active })}
                trackColor={{ false: "#d4d4da", true: colors.orange }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
          {occurrenceDate ? (
            <Copy style={styles.draftNote}>
              Selected payment is a scheduled projection. Next payment is the
              date saved for this subscription.
            </Copy>
          ) : null}
          <Copy style={styles.note}>
            Pausing tracking removes this item from your spending summary. It
            does not cancel your service.
          </Copy>
          <PrimaryButton
            title="Edit subscription"
            onPress={() => dismiss(onEdit)}
          />
          {confirmRemove ? (
            <View style={styles.confirm}>
              <Copy>Remove {item.name} from your saved subscriptions?</Copy>
              <TextButton
                title="Confirm removal"
                onPress={() => dismiss(onRemove)}
                destructive
              />
              <TextButton
                title="Keep subscription"
                onPress={() => setConfirmRemove(false)}
              />
            </View>
          ) : (
            <TextButton
              title="Remove subscription"
              onPress={() => setConfirmRemove(true)}
              destructive
            />
          )}
        </>
      )}
    </Sheet>
  );
}
export function BudgetSheet({
  amount,
  onClose,
  onSave,
}: {
  amount: number;
  onClose: () => void;
  onSave: (amount: number) => void;
}) {
  const [value, setValue] = useState(String(amount));
  const [error, setError] = useState("");
  return (
    <Sheet title="Monthly budget" onClose={onClose}>
      {(dismiss) => (
        <>
          <Copy style={styles.description}>
            Set a monthly limit for your recurring spending.
          </Copy>
          <Field label="Budget (THB)">
            <TextInput
              accessibilityLabel="Monthly budget in Thai baht"
              value={value}
              onChangeText={(text) => {
                setValue(text);
                setError("");
              }}
              keyboardType="decimal-pad"
              maxLength={12}
              style={styles.input}
            />
          </Field>
          {error ? (
            <Copy accessibilityRole="alert" style={styles.error}>
              {error}
            </Copy>
          ) : null}
          <View style={styles.action}>
            <PrimaryButton
              title="Save budget"
              onPress={() => {
                const next = Number(value.replace(/,/g, ""));
                if (!Number.isFinite(next) || next <= 0)
                  return setError("Enter a budget greater than ฿0.");
                dismiss(() => onSave(next));
              }}
            />
          </View>
          <TextButton title="Cancel" onPress={() => dismiss()} />
        </>
      )}
    </Sheet>
  );
}
function TextButton({
  title,
  onPress,
  destructive,
}: {
  title: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <MotionPressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.textButton}
    >
      <Copy
        style={{
          color: destructive ? "#d43b34" : colors.orangeInk,
          fontFamily: fonts.medium,
        }}
      >
        {title}
      </Copy>
    </MotionPressable>
  );
}
const styles = StyleSheet.create({
  gestureRoot: { flex: 1 },
  dragArea: { paddingTop: 10 },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  backdrop: { backgroundColor: "#00000055" },
  sheet: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    flexShrink: 1,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#c7c7cd",
    alignSelf: "center",
    marginBottom: 14,
  },
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    minHeight: 44,
  },
  title: { fontSize: 20, lineHeight: 26, fontFamily: fonts.display },
  close: { width: 44, height: 44, backgroundColor: "#e9e9ee" },
  content: { paddingBottom: 8 },
  description: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  field: { marginTop: 15, gap: 7 },
  label: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 17,
    color: "#6c6c74",
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    color: colors.ink,
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 23,
  },
  fieldRow: { flexDirection: "row", gap: 12 },
  column: { flex: 1 },
  action: { marginTop: 22 },
  error: { marginTop: 12, color: "#bf3029", fontSize: 13 },
  profile: { alignItems: "center", paddingVertical: 20, gap: 8 },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#fff2e5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  initials: {
    fontFamily: fonts.semibold,
    fontSize: 23,
    lineHeight: 28,
    color: colors.orangeInk,
  },
  profileName: {
    fontFamily: fonts.bold,
    fontSize: 26,
    lineHeight: 33,
    textAlign: "center",
  },
  card: { backgroundColor: "#ffffff", borderRadius: 17, paddingHorizontal: 15 },
  divider: { height: 1, backgroundColor: colors.line },
  note: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.muted,
    marginVertical: 20,
  },
  draftNote: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
  textButton: {
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  confirm: { gap: 10, marginTop: 12 },
  list: { paddingHorizontal: 0, marginTop: 16, overflow: "hidden" },
  empty: { padding: 20, color: colors.muted },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 58,
    gap: 10,
  },
});
