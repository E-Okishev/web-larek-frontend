import { FormErrors, IHomePage, IOrder, IProduct, TOrder } from "../types";
import { IEvents } from "./base/events";
import { Model } from './base/Model'

export class AppState extends Model<IHomePage> {
	protected _products: IProduct[];
	protected _order: IOrder = {
		payment: "",
		email: "",
		phone: "",
		address: "",
		items: [],
		total: 0
	};
	protected _basket: IProduct[] = [];
	protected _preview: string | null;
	protected events: IEvents;
	protected formErrors: FormErrors = {};

	set products(products: IProduct[]) {
		this._products = products;
	}

	set order(order: IOrder) {
		this._order = order;
	}

	get order() {
		return this._order
	}

	get basket() {
		return this._basket
	}

	get products() {
		return this._products
	}

	set id(id: string) {
		this.preview = id;
	}

	get id() {
		return this.preview;
	}

	getProduct(cardId: string) {
		return  this._products.find((item) => item.id === cardId)
	}

	set preview(cardId: string | null) {
		if (!cardId) {
			this._preview = null;
			return;
		}
		const selectedCard = this.getProduct(cardId);
		if (selectedCard) {
			this._preview = cardId;
		}
	}

	clearBasket() {
		this._basket.splice(0, this._basket.length)
	}

	toBasket(product: IProduct) {
		if(!this._basket.includes(product)) {
			this._basket.push(product)
		}
	}

	deleteFromBasket(product: IProduct) {
		let result = this.basket.filter(item => item.id !== product.id)
		this._basket = result
	}

	setTotal(): number {
		return this.basket.reduce((sum, product) => sum + product.price, 0);
	}

	validateOrder() {
		const errors: typeof this.formErrors = {};

		if(!this._order.payment) {
			errors.payment = 'Необходимо указать тип оплаты';
		}

		if (!this._order.address) {
			errors.address = 'Необходимо указать адрес';
		}

		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	validateContacts() {
		const errors: typeof this.formErrors = {};

		if (!this._order.email) {
			errors.email = 'Необходимо указать email';
		}

		if (!this._order.phone) {
			errors.phone = 'Необходимо указать телефон';
		}

		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	setOrderField(field: keyof TOrder, value: string) {
		this._order[field] = value;
		this.validateOrder() && this.validateContacts()
	}
}