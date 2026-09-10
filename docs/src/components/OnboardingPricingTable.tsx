import { DOCS_PLANS } from "../data/plans";

type Locale = "en" | "vi";

function formatVnd(amount: number, locale: Locale) {
	const formatted = new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US").format(amount);
	return `${formatted} VND`;
}

export function OnboardingPricingTable({ locale = "en" }: { locale?: Locale }) {
	const copy = locale === "vi"
		? {
			plan: "Gói hạn mức",
			quota: "Hạn mức GD/tháng",
			banks: "Tài khoản NH",
			price: "Giá",
			perMonth: "/tháng",
		}
		: {
			plan: "Quota Plan",
			quota: "Included Tx/mo",
			banks: "Bank accounts",
			price: "Price",
			perMonth: "/month",
		};

	return (
		<div className="table-container">
			<table>
				<thead>
					<tr>
						<th>{copy.plan}</th>
						<th>{copy.quota}</th>
						<th>{copy.banks}</th>
						<th>{copy.price}</th>
					</tr>
				</thead>
				<tbody>
					{DOCS_PLANS.map(plan => (
						<tr key={plan.name}>
							<td><strong>{plan.displayName || plan.name}</strong></td>
							<td>{plan.includedTx.toLocaleString()}</td>
							<td>{plan.maxBanks.toLocaleString()}</td>
							<td>{formatVnd(plan.price, locale)}{copy.perMonth}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
