import { useSession } from "@/ctx/auth";
import {
  BUDGET,
  SAMPLE_SUBSCRIPTIONS,
  upcomingPayments,
  type Category,
} from "./model";
import {
  AddSubscriptionSheet,
  BudgetSheet,
  SettingsSheet,
  SubscriptionDetailSheet,
  SubscriptionListSheet,
} from "./overview-sheets";
import { useSubscriptions } from "./subscriptions-context";

export type SubscriptionSheet =
  | "add"
  | "settings"
  | "all"
  | "reminders"
  | "budget"
  | { detail: string; occurrenceDate?: string }
  | { edit: string; occurrenceDate?: string }
  | { category: Category }
  | null;
export function SubscriptionSheets({
  sheet,
  onClose,
  onSelect,
  addDate,
}: {
  sheet: SubscriptionSheet;
  onClose: () => void;
  onSelect: (sheet: SubscriptionSheet) => void;
  addDate?: string;
}) {
  const {
    subscriptions,
    save,
    monthlyBudget,
    saveBudget,
    draft,
    setDraft,
    notify,
  } = useSubscriptions();
  const { session, signOut } = useSession();
  const detailSheet =
    typeof sheet === "object" && sheet && ("detail" in sheet || "edit" in sheet)
      ? sheet
      : null;
  const selected = detailSheet
    ? subscriptions.find(
        (item) =>
          item.id ===
          ("detail" in detailSheet ? detailSheet.detail : detailSheet.edit),
      )
    : undefined;
  const editing = detailSheet !== null && "edit" in detailSheet;
  const occurrenceDate = detailSheet?.occurrenceDate;
  const category =
    typeof sheet === "object" && sheet !== null && "category" in sheet
      ? sheet.category
      : null;
  return (
    <>
      {sheet === "add" ? (
        <AddSubscriptionSheet
          initialDate={addDate}
          draft={draft}
          onDraftChange={setDraft}
          onClose={() => {
            onClose();
            if (draft) notify("Draft saved for this session");
          }}
          onDiscardDraft={() => {
            setDraft(null);
            onClose();
            notify("Draft discarded");
          }}
          onAdd={(item) => {
            save([...subscriptions, item]);
            setDraft(null);
            onClose();
            notify("Subscription added");
          }}
        />
      ) : null}
      {sheet === "settings" ? (
        <SettingsSheet
          session={session}
          monthlyBudget={monthlyBudget}
          onEditBudget={() => onSelect("budget")}
          onClose={onClose}
          onReset={() => {
            save(SAMPLE_SUBSCRIPTIONS);
            saveBudget(BUDGET);
            setDraft(null);
            onClose();
            notify("Sample data reset");
          }}
          onSignOut={() => {
            onClose();
            signOut();
          }}
        />
      ) : null}
      {sheet === "budget" ? (
        <BudgetSheet
          amount={monthlyBudget}
          onClose={onClose}
          onSave={(amount) => {
            saveBudget(amount);
            onClose();
            notify("Monthly budget updated");
          }}
        />
      ) : null}
      {sheet === "all" || sheet === "reminders" || category ? (
        <SubscriptionListSheet
          title={
            category
              ? `${category} subscriptions`
              : sheet === "all"
                ? "All subscriptions"
                : "Payment reminders"
          }
          items={
            category
              ? subscriptions.filter(
                  (item) => item.active && item.category === category,
                )
              : sheet === "all"
                ? subscriptions
                : upcomingPayments(subscriptions)
          }
          onClose={onClose}
          onSelect={(detail) => onSelect({ detail })}
        />
      ) : null}
      {selected && editing ? (
        <AddSubscriptionSheet
          key={`edit-${selected.id}`}
          item={selected}
          onClose={() =>
            onSelect({
              detail: selected.id,
              occurrenceDate,
            })
          }
          onAdd={(item) => {
            save(subscriptions.map((s) => (s.id === item.id ? item : s)));
            onClose();
            notify("Changes saved");
          }}
        />
      ) : selected ? (
        <SubscriptionDetailSheet
          key={selected.id}
          item={selected}
          occurrenceDate={occurrenceDate}
          onEdit={() =>
            onSelect({
              edit: selected.id,
              occurrenceDate,
            })
          }
          onClose={onClose}
          onChange={(item) =>
            save(subscriptions.map((s) => (s.id === item.id ? item : s)))
          }
          onRemove={() => {
            save(subscriptions.filter((item) => item.id !== selected.id));
            onClose();
            notify("Subscription removed");
          }}
        />
      ) : null}
    </>
  );
}
