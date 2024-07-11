import { IEvents } from '../base/events'
import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';

interface IFormState {
	valid: boolean;
	errors: string[];
}

export class Form<IOrder> extends Component<IFormState> {
	protected submitBtn: HTMLButtonElement;
	protected formName: string;
	protected _errors: HTMLElement;
	protected _form: HTMLFormElement;

	constructor(container: HTMLFormElement, protected events: IEvents) {
		super(container)

		this.submitBtn = ensureElement<HTMLButtonElement>('.button', this.container);
		this._errors = ensureElement<HTMLElement>('.form__errors', this.container);
		this.formName = this.container.getAttribute('name');

		this.container.addEventListener('submit', (e) => {
			e.preventDefault()
			events.emit(`${this.formName}:submit`)
		})

		this.container.addEventListener('input', (e: Event) => {
			const target = e.target as HTMLInputElement;
			const field = target.name as keyof IOrder;
			const value = target.value;
			this.onInputChange(field, value);
		});
	}

	protected onInputChange(field: keyof IOrder, value: string) {
		this.events.emit(`${this.formName}.${String(field)}:change`, {
			field,
			value
		});
	}

	set valid(value: boolean) {
		this.setDisabled(this.submitBtn, !value)
	}

	set errors(value: string) {
		this.setText(this._errors, value);
	}

	close() {
		this._form.reset();
	}

	render(state: Partial<IOrder> & IFormState) {
		const {valid, errors, ...inputs} = state;
		super.render({valid, errors});
		Object.assign(this, inputs);
		return this.container;
	}
}