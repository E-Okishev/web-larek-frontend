export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number
}

export interface IProductsList {
	products: IProduct[];
	preview: string | null;
}

export type IBasket = Pick<IProduct, 'title' | 'price'>;

export interface IOrder {
	payment: string;
	adress: string;
}

export interface IBuyerInfo {
	email: string;
	phone: string;
}

export interface IOrderData {
	CheckValidation(data: Record<keyof IOrder, string>): boolean;
}

export interface IBuyerInfoData {
	CheckValidation(data: Record<keyof IBuyerInfo, string>): boolean;
}