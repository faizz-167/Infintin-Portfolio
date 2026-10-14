"use client";

import { Checkbox } from "@/components/ui/Checkbox";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { emailRule } from "@/lib/enquiry";

// Client component because validation rules are functions, which can't be
// passed from a Server Component.
export function SpecimenForm() {
  return (
    <form className="flex max-w-[32rem] flex-col gap-2" noValidate>
      <Field
        label="Work email"
        name="email"
        type="email"
        required
        autoComplete="email"
        help="We reply from the engineering team."
        validate={emailRule}
      />
      <Field label="Message" name="message" multiline />
      <Select
        label="Enquiry type"
        name="type"
        placeholder="Choose one"
        options={[
          { value: "oem", label: "OEM integration" },
          { value: "pilot", label: "Pilot project" },
        ]}
      />
      <Checkbox name="consent" required>
        I agree to be contacted about this enquiry
      </Checkbox>
    </form>
  );
}
