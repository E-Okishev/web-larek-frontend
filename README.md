# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Данные и типы данных, используемые в приложении

Карточка товара
```
export interface IProduct {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number
}
```
Массив карточек на главной странице
```
export interface IProductsList {
    products: IProduct[];
    preview: string | null;
}
```
Информация о товарах в корзине
```
export type IBasket = Pick<IProduct, 'title' | 'price'>;
```
Форма ввода данных об адресе и способе доставки
```
export interface IOrder {
    payment: string;
    adress: string;
}
```
Форма ввода контактных данных покупателя
```
export interface IBuyerInfo {
    email: string;
    phone: string;
}
```
Проверка валидации форм
```
export interface IOrderData {
    CheckValidation(data: Record<keyof IOrder, string>): boolean;
}

export interface IBuyerInfoData {
    CheckValidation(data: Record<keyof IBuyerInfo, string>): boolean;
}
```

## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP:
- слой представления, отвечает за отображение данных на странице,
- слой данных, отвечает за хранение и изменение данных
- презентер, отвечает за связь представления и данных.

### Базовый код

#### Класс Api
Содержит в себе базовую логику отправки запросов. В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов.
`constructor(baseUrl: string, options: RequestInit = {})`- принимает базовый URL и глобальные опции для всех запросов(опционально).

Методы:
- `get` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер
- `post` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.
- `handleResponse` - метод проверяет, успешен ли ответ. Если ответ успешен, возвращает промис с данными. Если ответ неуспешен, возвращает ошибку с описанием из ответа или статусом ответа.

#### Класс EventEmitter
```
export class EventEmitter implements IEvents {
    _events: Map<EventName, Set<Subscriber>>;

    constructor() {
        this._events = new Map<EventName, Set<Subscriber>>();
    }
}
```
Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.

Конструктор выполняет инициализацию объекта, создавая пустую структуру данных для хранения событий
```
constructor() {
    this._events = new Map<EventName, Set<Subscriber>>();
}
```

Поля:

- `events = new Map<EventName, Set<Subscriber>>()` - используется для хранения информации о событиях и их подписчиках

Основные методы, реализуемые классом описаны интерфейсом `IEvents`:
- `on` - установка обработчика на событие
- `off` - снятие обработчика с события
- `emit` - инициализация события
- `trigger` - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие
- `onAll` - установка слушашателя на все события
- `offAll` - сброс всех обработчиков с события

#### Класс Component
```
class Component<T extends HTMLElement> {
    container: T;
    events: IEvents;

    constructor(container: T) {
        this.container = container;
        this.events = events;
    }
}
```

Представляет собой базовые поля и методы, необходимые для отрисовки компонентов на странице.

Конструктор:

- `constructor(container: HTMLElement, events: IEvents)` - конструктор принимает принимает DOM-элемент и экземпляр класса EventEmmiter

- `container: HTMLElement` - DOM-элемент контейнера

- `events: IEvents` - брокер событий

Методы:

- `toggleClass` - переключение класса
- `setDisable` - деактивация кнопок
- `setActive` - активация кнопок
- `setHidden` - скрытие элемента
- `setVisible` - отображение элемента
- `setText` - установка текста
- `setImage` - установка изображения
- `render` - Отображение данных.

### Слой данных

#### Класс AppInfo
```
class AppInfo {
    products: IProduct[];
    preview: IProduct | null;
    basket: IBasket;
    order: IOrder | null;
    formErrors: Partial<Record<string, string>>;
    events: IEvents;

    constructor(events: IEvents) {
        this.events = events;
    }
}
```

Класс отвечает за хранение и логику работы с данными приложения\

Конструктор:
- `constructor(events: IEvents)` - конструктор класса принимает инстант брокера событий

В полях класса хранятся следующие данные:
- `products: IProduct[]` - массив карточек продуктов
- `preview: IProduct | null` - просмотр подробной информации о продукте
- `basket: IBasket` -  товары, добавленные пользователем в корзину
- `order: IOrder | null` - информация о заказе
- `formErrors: Partial<Record<string, string>>` - сообщение об ошибке при вводе данных в форме
- `events: IEvents` - события, происходящие на странице

Методы: 
- `setProducts()` - вывод списка продуктов
- `setPreview()` - выбор продукта для предпросмотра
- `addToBasket()` - добавление товара в корзину.
- `removeFromBasket()` - удаление товара из корзины
- `clearBasket()` - очищаение корзины
- `getTotal()` - отображение суммы всех товаров в корзине
- `setPaymentMethod()` - выбор способа оплаты
- `setOrderField()` - ввод данных в поле заказа
- `validateOrder()` - проверка данных для заказа
- `clearErrors()` - очищение сообщений о ошибках форм

#### Класс Product

Класс отвечает за хранение и логику работы с данными карточки продукта. Класс наследуется от абстрактного класса Component.

Конструктор наследуется от абстрактного класса Component.

В полях класса хранятся следующие данные:
- `id: string` - уникальный номер товара
- `description: string` - описание товара
- `image: string` - изображение товара
- `title: string` - наименование товара
- `category: string` - категория, к которой относится товар
- `price: number` - стоимость товара

Методы:
- `getId()` - получение уникального номера
- `setTitle()` - установка наименования товара
- `setPrice()` - установка стоимости товара
- `setDescription()` - установка описания товара
- `setCategory()` - установка категории товара
- `setImage()` - установка изображения товара

#### Класс Page

Реализует отобржение корзины с количеством товара в ней и массив карточек товаров. Класс наследуется от абстрактного класса Component.

Конструктор наследуется от абстрактного класса Component.

Поля класса:
- `counter: number` - счетчик элементов в корзине
- `catalog: HTMLElement` - массив карточек товаров
- `basket: HTMLElement` - корзина с выбранными товарами

Методы класса:
- `counter()` - управление отображением количества товаров в корзие
- `catalog()` - управление массивом карточек
- `locked()` - управление блокировкой для прокрутки при открытии модального окна

#### Класс Modal
Реализует модальное окно, содержит методы `open` и `close` для управления отображением модального окна. Устанавливает слушатели на клавиатуру для закрытия модального окна по клику на оверлей или крестик. Класс наследуется от абстрактного класса Component

Конструктор: 
- `constructor(container: HTMLElement, events: IEvents)` -  наследуется от абстрактного класса Component

Поля класса:
- `container: HTMLElement` - элемент модального окна
- `events: IEvents` - брокер событий
- `content: HTMLElement` - контент, находящийся в модальном окне
- `closeButton: HTMLButtonElement`- кнопка закрытия модального окна

Методы класса: 
- `setContent()` - присваивает контен модальному окну
- `open()` - управляет отображением модального окна - показывает на странице
- `close()` - управляет отображением модального окна - скрывает со страницы
- `render()` - наследует и расширяет метод родительского класса. Возвращает заполненный данными корневой DOM-элемент

#### Класс ModalWithBasket
Расширяет класс Modal. Предназначен для реализации модального окна с формой, содержащей информацию о выбранных для оформления товарах. При сабмите инициирует событие подтверждения данных и переходу к оформлению заказа.

Конструктор: 
- `constructor(container: HTMLElement, events: IEvents)` -  наследуется от абстрактного класса Modal

Поля класса:
- `submitButton: HTMLButtonElement` - кнопка подтверждения
- `_form: HTMLFormElement` - элемент формы
- `formName: string` - значение атрибута name формы
- `list: HTMLElement[]` - коллекция всех выбранных товаров
- `total: string` - сумма для оплаты

Методы: 
- `deleteProduct()` - удаление товара из корзины
- `setItemsList()` - вывод списка выбранных товаров
- `setTotal()` - вывод общей стоимости товаров

#### Класс ModalForOrder
Реализует модальное окно для ввода данных для оформления заказа. Класс наследуется от абстрактного класса Component

Конструктор: 
- `constructor(container: HTMLElement, events: IEvents)` -  наследуется от абстрактного класса Component

Поля класса:
- `submitButton: HTMLButtonElement` - кнопка подтверждения
- `errors: Record<string, HTMLElement>` - объект хранящий все элементы для вывода ошибок под полями формы с привязкой к атрибуту name инпутов
- `inputs: NodeListOf<HTMLInputElement>` - коллекции всех полей ввода формы

Методы: 
- `setError()` - принимает объект с данными для отображения или скрытия ошибок под полями ввода
- `showInputError()`- отображает полученный текст ошибки под указанным полем ввода
- `hideInputError()` - скрывает текст ошибки под указанным полем ввода
- `clearModal()` - очищает поля формы и сбрасывает состояния кнопок при сабмите


#### Класс ModalWithAdress
Расширяет класс ModalForOrder. Предназначен для реализации модального окна с формой, содержащей поле ввода адреса и способов оплаты заказа. При сабмите инициирует событие подтверждения данных для отправки и оплаты заказа. Предоставляет методы для отображения ошибок и управления активностью кнопки сохранения.

Конструктор: 
- `constructor(container: HTMLElement, events: IEvents)` - конструктор наследуется от абстрактного класса ModalForOrder

Поля класса:
- `PaymentButton: HTMLButtonElement` - кнопка выбора способа оплаты
- `_form: HTMLFormElement` - элемент формы
- `formName: string` - значение атрибута name формы


Методы: 
- `setAddress()` - устанавливает значение в поле адреса
- `setPayment()` - переключает выбранную пользователем кнопку выбора способа оплаты


#### Класс ModalWithContacts
Расширяет класс ModalForOrder. Предназначен для реализации модального окна с формой, содержащей поля ввода телефона и эмейла. При сабмите инициирует событие подтверждения данных и переход на окно с уведомлением об успешном оформлении заказа.

Конструктор: 
- `constructor(container: HTMLElement, events: IEvents)` - конструктор наследуется от абстрактного класса ModalForOrder 

Поля класса:
- `_form: HTMLFormElement` - элемент формы
- `formName: string` - значение атрибута name формы

Методы: 
- `setEmail()` - устанавливает значение в поле почтового адреса 
- `setPhone()` - устанавливает значение в поле контактного телефона 

#### Класс SuccessfulOrder
Расширяет класс ModalForOrder. Предназначен для реализации модального окна с формой, содержащей сообщение об успешном оформлении заказа, в которое передаётся полная стоимость корзины. 

Конструктор: 
- `constructor(container: HTMLElement, events: IEvents)` - конструктор наследуется от абстрактного класса ModalForOrder

Поля класса:
- `closeButton: HTMLButtonElement` - кнопка закрытия формы при успешном оформлении заказа
- `total: number` - общая сумма покупки

Методы: 
- `setTotal()` - устанавливает значение в поле общей суммы заказа

### Взаимодействие компнонетов
Взаимодействие осуществляется за счет событий, генерируемых с помощью броекера событий и их обработчиков. 

Список событий, которые могут генерироваться в системе

- `products:changed` - изменение массива карточек товаров.
- `product:selected` - при клике на товар всплывает модальное окно с подробной информацией о товаре и возможностью добавления товара в корзину.
- `basket:open`- открытие модального окна с содержимым корзины.
- `basket:toggleItem` - при клике в модальном окне товара на кнопку "добавить в корзину" происходит добавление товара.
- `basket:deleteItem` - при клике на кнопку удаления товара в корзине.
- `basket:order` - оформление заказа из корзины.
- `payment:change` - выбор способа оплаты.
- `address:input` - ввод адреса доставки заказа.
- `order:submit` - подтверждение данных для оплаты и доставки.
- `email:input` - ввод почтового адреса клиента.
- `phone:input` - ввод телефона клиента.
- `contacts:submit` - подтверждение контактных данных.
- `order:complete` - при открытии окна успешной оплаты.
- `order:validation` - событие, сообщающее о необходимости валидации формы с вводом адреса и способа оплаты.
- `contacts::validation` - событие, сообщающее о необходимости валидации формы с контактными данными. 
