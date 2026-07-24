import {useState} from "react";
import {DOCS_PLANS} from "../data/plans";

type Locale = "en" | "vi";

const terms = [
	{months: 1, discount: 0},
	{months: 3, discount: 5},
	{months: 6, discount: 10},
	{months: 12, discount: 15},
] as const;

function formatVnd(amount: number, locale: Locale) {
	const formatted = new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US").format(amount);
	return locale === "vi" ? `${formatted} VND` : `${formatted} VND`;
}

export function PricingTabs({locale = "en"}: {locale?: Locale}) {
	const [termMonths, setTermMonths] = useState<(typeof terms)[number]["months"]>(1);
	const activeTerm = terms.find(term => term.months === termMonths) || terms[0];
	const copy = locale === "vi"
		? {
			term: (months: number) => (months === 12 ? "1 năm" : `${months} tháng`),
			plan: "Gói",
			price: "Giá",
			effective: "Tương đương/tháng",
			banks: "Tài khoản ngân hàng",
		}
		: {
			term: (months: number) => (months === 12 ? "1 year" : `${months} months`),
			plan: "Plan",
			price: "Price",
			effective: "Effective/month",
			banks: "Bank accounts",
		};

	return (
		<div className="pricing-tabs">
			<div className="pricing-tabs__list" role="tablist" aria-label="Pricing term">
				{terms.map(term => (
					<button
						key={term.months}
						type="button"
						onClick={() => setTermMonths(term.months)}
						className={`pricing-tabs__trigger ${termMonths === term.months ? "pricing-tabs__trigger--active" : ""}`}
						role="tab"
						aria-selected={termMonths === term.months}
					>
						<span>{copy.term(term.months)}</span>
						{term.discount > 0 && (
							<span className="pricing-tabs__badge">-{term.discount}%</span>
						)}
					</button>
				))}
			</div>
			<div className="table-container">
				<table>
					<thead>
						<tr>
							<th>{copy.plan}</th>
							<th>{copy.price}</th>
							<th>{copy.effective}</th>
							<th>{copy.banks}</th>
						</tr>
					</thead>
					<tbody>
						{DOCS_PLANS.map(plan => {
							const subtotal = plan.price * termMonths;
							const discount = Math.round((subtotal * activeTerm.discount) / 100);
							const total = subtotal - discount;
							return (
								<tr key={plan.name}>
									<td>{plan.name}</td>
									<td>{formatVnd(total, locale)}</td>
									<td>{formatVnd(Math.round(total / termMonths), locale)}</td>
									<td>{plan.banks}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
