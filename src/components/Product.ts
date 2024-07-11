import { ensureElement } from '../utils/utils'
import { IProduct } from "../types";
import { Component } from './base/Component'

interface IProductActions {
	onClick: (event: MouseEvent) => void;
}

export class Product extends Component<IProduct> {
	protected _image?: HTMLImageElement;
	protected _title: HTMLElement;
	protected _category?: HTMLElement;
	protected _price: HTMLElement;
	protected _description?: HTMLElement;
	protected _button?: HTMLElement;
	protected _index?: HTMLElement;
	protected _categoryColor = <Record<string, string>> {
		"софт-скил": "soft",
		"другое": "other",
		"дополнительное": "additional",
		"кнопка": "button",
		"хард-скил": "hard"
	}


	constructor(blockName: string, container: HTMLElement, actions?: IProductActions) {
		super(container)
		this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
		this._image = container.querySelector(`.${blockName}__image`);
		this._category = container.querySelector(`.${blockName}__category`);
		this._price = container.querySelector(`.${blockName}__price`);
		this._description = container.querySelector(`.${blockName}__text`);
		this._button = container.querySelector(`.${blockName}__button`);
		this._index = container.querySelector(`.basket__item-index`);

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title)
	}

	set price(value: string) {
		value ? this.setText(this._price, `${value} синапсов`) : this.setText(this._price, `Бесценно`)
	}

	set category(value: string) {
		this.setText(this._category, value);
		this.toggleClass(this._category, `card__category_${this._categoryColor[value]}`, true)
	}

	set description(value: string) {
		this.setText(this._description, value)
	}

	get button() {
		return this._button
	}

	set index(value: number | null) {
		this.setText(this._index, value)
	}
}