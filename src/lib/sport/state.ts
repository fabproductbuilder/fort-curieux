import type { SportActionState, SportTemplateFormState } from "@/types/sport";

export const initialSportTemplateFormState: SportTemplateFormState = {
	status: "idle",
	message: "",
};

export const initialSportActionState: SportActionState = {
	status: "idle",
	message: "",
};
