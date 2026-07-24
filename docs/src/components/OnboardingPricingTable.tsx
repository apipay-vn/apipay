import { DOCS_PLANS } from "../data/plans";

type Locale = "en" | "vi";

function formatVnd(amount: number, locale: Locale) {
	const formatted = new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US").format(amount);
	return `${formatted} VND`;
}

export function OnboardingPricingTable({ locale = "en" }: { locale?: Locale }) {
	const copy = locale === "vi"
		? {
			plan: "Gói",
			price: "Giá",
			banks: "Tài Khoản Ngân Hàng",
			perMonth: "/tháng",
			bankUnit: (count: number) => `${count} tài khoản`,
		}
		: {
			plan: "Plan",
			price: "Price",
			banks: "Bank Accounts",
			perMonth: "/month",
			bankUnit: (count: number) => `${count} ${count === 1 ? "account" : "accounts"}`,
		};

	return (
		<div className="table-container">
			<table>
				<thead>
					<tr>
						<th>{copy.plan}</th>
						<th>{copy.price}</th>
						<th>{copy.banks}</th>
					</tr>
				</thead>
				<tbody>
					{DOCS_PLANS.map(plan => (
						<tr key={plan.name}>
							<td>{plan.name}</td>
							<td>{formatVnd(plan.price, locale)}{copy.perMonth}</td>
							<td>{copy.bankUnit(plan.banks)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
