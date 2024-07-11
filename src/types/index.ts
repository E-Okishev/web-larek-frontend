export interface IHomePage {
	catalog: IProduct[];
	basket: string[];
	order: IOrder | null;
	basketTotal: number;
	preview: string | null;
}

export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
	index:  number;
}

export interface IOrder {
	payment: string;
	email: string;
	phone: string;
	address: string;
	items: string[];
	total: number;
}

export interface IOrderResult {
	id: string;
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IApi {
	getProducts: () => Promise<IProduct[]>
	orderProducts(order: IOrder): Promise<IOrderResult>
}

export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export type TOrder = Pick<IOrder, 'payment' | 'address' | 'email' | 'phone'>;