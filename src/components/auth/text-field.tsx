type TextFieldProps = {
	label: string;
	name: string;
	type?: "email" | "password" | "text";
	autoComplete?: string;
	required?: boolean;
};

export function TextField({ label, name, type = "text", autoComplete, required = false }: TextFieldProps) {
	return (
		<label className="block text-sm font-medium text-night" htmlFor={name}>
			<span>{label}</span>
			<input
				id={name}
				name={name}
				type={type}
				required={required}
				autoComplete={autoComplete}
				className="mt-2 h-12 w-full rounded-md border border-night/18 bg-white px-4 text-base text-night outline-none transition placeholder:text-night/35 focus:border-accent focus:ring-2 focus:ring-accent/25"
			/>
		</label>
	);
}
