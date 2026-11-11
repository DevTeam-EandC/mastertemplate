
import { createContext, useContext, useState } from "react";
import { ELEVATOR_TYPES } from "../data/constants";
import { useClients } from "./ClientsContext";
import {
    defaultClientForm,
    fullName,
    groupCodes,
    makeCode,
    newElevatorGroup,
    project_codeFor,
    totalAllocated,
    validateCustomer,
    validateProject,
} from "../utils/rfq";

const RfqFormContext = createContext(null);
export const useRfqForm = () => useContext(RfqFormContext);

const SEQ_KEY = "elevate-rfq-seq";
const DRAFT_KEY = "elevate-rfq-draft";

const readSeqStore = () => {
    try {
        return JSON.parse(localStorage.getItem(SEQ_KEY) || "{}");
    } catch {
        return {};
    }
};

const nextSeq = () => {
    const s = readSeqStore();
    return s.year === new Date().getFullYear()
        ? (s.last || 0) + 1
        : 1;
};

export function RfqFormProvider({ children }) {
    const { addClient } = useClients();

    const [form, setForm] = useState(defaultClientForm);
    const [seq, setSeq] = useState(nextSeq);
    const [hasDraft, setHasDraft] = useState(
        () => !!localStorage.getItem(DRAFT_KEY)
    );

    const update = (k, v) =>
        setForm((f) => ({ ...f, [k]: v }));

    const updateGroup = (i, k, v) =>
        setForm((f) => ({
            ...f,
            elevator_specs: f.elevator_specs.map((g, j) =>
                j === i ? { ...g, [k]: v } : g
            ),
        }));

    const clientName = fullName(form);
    const total = Number(form.total_qty) || 0;
    const allocated = totalAllocated(form.elevator_specs);
    const allCodes = form.elevator_specs.flatMap(groupCodes);
    const project_code = project_codeFor(form, seq);

    const autoProjectCode = () =>
        update(
            "project_code",
            makeCode(form.project_name.trim() || clientName)
        );

    const addGroup = () =>
        setForm((f) => ({
            ...f,
            elevator_specs: [
                ...f.elevator_specs,
                newElevatorGroup(),
            ],
        }));

    const removeGroup = (i) => {
        if (form.elevator_specs.length > 1) {
            setForm((f) => ({
                ...f,
                elevator_specs: f.elevator_specs.filter(
                    (_, j) => j !== i
                ),
            }));
        }
    };

    const duplicateGroup = (i) =>
        setForm((f) => ({
            ...f,
            elevator_specs: [
                ...f.elevator_specs.slice(0, i + 1),
                { ...f.elevator_specs[i], unit_type: "" },
                ...f.elevator_specs.slice(i + 1),
            ],
        }));

    const recode = () => {
        const counts = {};

        setForm((f) => ({
            ...f,
            elevator_specs: f.elevator_specs.map((g) => {
                const p = ELEVATOR_TYPES[g.elevator_type] || "XX";
                counts[p] = (counts[p] || 0) + 1;

                const code = `${p}-${String(counts[p]).padStart(2, "0")}`;

                counts[p] += Math.max(
                    0,
                    (Number(g.quantity) || 1) - 1
                );

                return { ...g, unit_type: code };
            }),
        }));
    };

    // Save the current form as a draft.
    const saveDraft = () => {
        localStorage.setItem(
            DRAFT_KEY,
            JSON.stringify({ form, seq })
        );

        setHasDraft(true);
    };

    // Restore a previously saved draft.
    const restoreDraft = () => {
        try {
            const d = JSON.parse(localStorage.getItem(DRAFT_KEY));

            if (d?.form) {
                setForm(d.form);
                setSeq(d.seq || 1);
            }
        } catch {
            // Ignore a corrupt draft.
        }

        setHasDraft(false);
    };

    // Delete a saved draft.
    const dismissDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
        setHasDraft(false);
    };

    // Reset the current form without deleting a saved draft.
    const resetForm = () => {
        setForm(defaultClientForm());
    };

    /**
     * Validates both pages, saves the client, and resets the form.
     * Returns { error } or { payload }.
     */
    const submit = () => {
        const issue =
            validateCustomer(form) ||
            validateProject(form);

        if (issue) {
            return { error: issue };
        }

        const year = new Date().getFullYear();
        const store = readSeqStore();

        const finalSeq =
            store.year === year
                ? (store.last || 0) + 1
                : 1;

        localStorage.setItem(
            SEQ_KEY,
            JSON.stringify({
                year,
                last: finalSeq,
            })
        );

        const payload = {
            project_code: project_codeFor(form, finalSeq),
            rfq_sequence: finalSeq,

            client: {
                ...form,
                full_name: clientName,
            },

            project: {
                project_type: form.project_type,
                elevator_category: form.elevator_category,
                project_code: form.project_code,
                project_name: form.project_name,
                building_type: form.building_type,
                project_location: form.project_location,
                sales_id: form.sales_id,
                account_manager_id: form.account_manager_id,
                source: form.source,
                unit_type: form.unit_type,
                referral: form.referral,
                remarks: form.remarks,
                quotation_purpose: form.quotation_purpose,
            },

            total_elevators: total,

            elevator_specs: form.elevator_specs.map((g) => ({
                ...g,
                car_codes: groupCodes(g),
            })),

            all_car_codes: allCodes,
        };

        addClient({
            ...form,
            elevatorCount: total,
            unitType: form.unit_type,
            project_code: payload.project_code,
            rfqPayload: payload,
        });

        localStorage.removeItem(DRAFT_KEY);
        setHasDraft(false);

        setForm(defaultClientForm());
        setSeq(finalSeq + 1);

        return { payload };
    };

    return (
        <RfqFormContext.Provider
            value={{
                form,
                setForm,
                update,
                updateGroup,

                clientName,
                total,
                allocated,
                allCodes,
                project_code,
                setSeq,

                autoProjectCode,
                addGroup,
                removeGroup,
                duplicateGroup,
                recode,

                hasDraft,
                saveDraft,
                restoreDraft,
                dismissDraft,
                resetForm,
                submit,
            }}
        >
            {children}
        </RfqFormContext.Provider>
    );
}
