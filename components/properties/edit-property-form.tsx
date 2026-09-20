"use client";

import {
    useActionState,
} from "react";

import {
    updatePropertyAction,
} from "@/app/(app)/properties/manage-actions";

import {
    INITIAL_ACTION_STATE,
} from "@/lib/action-state";

import {
    ActionMessage,
} from "@/components/forms/action-message";

import {
    SubmitButton,
} from "@/components/forms/submit-button";

type Props = {
    property: {
        id: string;
        name: string;
        type: string;

        addressLine1:
        string | null;

        barangay:
        string | null;

        city:
        string | null;

        province:
        string | null;

        postalCode:
        string | null;

        description:
        string | null;
    };
};

export function EditPropertyForm({
    property,
}: Props) {
    const [
        state,
        action,
    ] =
        useActionState(
            updatePropertyAction.bind(
                null,
                property.id,
            ),

            INITIAL_ACTION_STATE,
        );

    return (
        <form
            action={action}
            className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
        >
            <ActionMessage
                state={state}
            />

            <Field
                label="Property name"
                name="name"
                defaultValue={
                    property.name
                }
                required
            />

            <div>
                <label className="mb-2 block text-sm font-medium text-zinc-800">
                    Property type
                </label>

                <select
                    name="type"
                    defaultValue={
                        property.type
                    }
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm"
                >
                    <option value="BOARDING_HOUSE">
                        Boarding House
                    </option>

                    <option value="APARTMENT">
                        Apartment
                    </option>

                    <option value="DORMITORY">
                        Dormitory
                    </option>

                    <option value="BEDSPACE">
                        Bedspace
                    </option>

                    <option value="HOUSE">
                        House
                    </option>

                    <option value="COMMERCIAL">
                        Commercial
                    </option>

                    <option value="OTHER">
                        Other
                    </option>
                </select>
            </div>

            <Field
                label="Street / Address"
                name="addressLine1"
                defaultValue={
                    property.addressLine1 ??
                    ""
                }
            />

            <div className="grid gap-5 sm:grid-cols-2">
                <Field
                    label="Barangay"
                    name="barangay"
                    defaultValue={
                        property.barangay ??
                        ""
                    }
                />

                <Field
                    label="City"
                    name="city"
                    defaultValue={
                        property.city ??
                        ""
                    }
                />

                <Field
                    label="Province"
                    name="province"
                    defaultValue={
                        property.province ??
                        ""
                    }
                />

                <Field
                    label="Postal code"
                    name="postalCode"
                    defaultValue={
                        property.postalCode ??
                        ""
                    }
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium text-zinc-800">
                    Description
                </label>

                <textarea
                    name="description"
                    rows={4}
                    defaultValue={
                        property.description ??
                        ""
                    }
                    className="w-full resize-none rounded-xl border border-zinc-200 px-4 py-3 text-sm"
                />
            </div>

            <SubmitButton
                pendingText="Saving changes..."
                className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-60 sm:w-auto"
            >
                Save changes
            </SubmitButton>
        </form>
    );
}

function Field({
    label,
    name,
    defaultValue,
    required,
}: {
    label: string;
    name: string;
    defaultValue: string;
    required?: boolean;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-zinc-800">
                {label}
            </label>

            <input
                name={name}
                required={required}
                defaultValue={
                    defaultValue
                }
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm"
            />
        </div>
    );
}