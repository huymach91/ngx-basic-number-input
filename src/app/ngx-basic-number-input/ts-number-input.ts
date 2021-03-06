export interface INumberInputOptional {
  separator: ',' | '.';
  fractionDigits: number;
  negative?: boolean;
  percentage?: boolean;
}

export class NumberInput {
  private keydownRef: any;
  private keyupRef: any;
  private arrowKeys: Array<string> = ['ArrowLeft', 'ArrowRight'];
  private removeKeys: Array<string> = ['Backspace', 'Delete'];
  private moveKeys: Array<string> = ['Home', 'End'];
  private separatorKeys: Array<string> = ['.', ','];
  private currentCaret: number = -1;

  private priorValue: string = '';

  private isArrowKey: boolean = false;
  private isNumberKey: boolean;
  private isRemoveKey: boolean = false;
  private isPaste: boolean = false;
  private isSeprator: boolean = false;

  private fractionalChar: string;

  constructor(
    private element: HTMLInputElement,
    private optional: INumberInputOptional = {
      separator: ',',
      fractionDigits: 0,
    }
  ) {
    this.fractionalChar = this.optional.separator === ',' ? '.' : ',';
    this.separatorKeys = this.optional.fractionDigits
      ? ['.', ',']
      : [this.optional.separator];
    this.init();
  }

  private init() {
    this.keydownRef = this.keydown.bind(this);
    this.keyupRef = this.keyup.bind(this);
    this.element.addEventListener('keydown', this.keydownRef);
    this.element.addEventListener('keyup', this.keyupRef);
  }

  private keydown(event: KeyboardEvent) {
    const key = event.key.toString();
    const isSelect = event.ctrlKey && key === 'a';
    const isCopy = event.ctrlKey && key === 'c';
    const isPaste = event.ctrlKey && key === 'v';
    const isCut = event.ctrlKey && key === 'x';
    const isUndo = event.ctrlKey && key === 'z';
    // reset
    this.isRemoveKey = false;
    this.isNumberKey = false;
    this.isArrowKey = false;
    this.isPaste = false;
    this.isSeprator = false;

    this.currentCaret = -1;
    this.priorValue = '';

    // case 1: not match any conditions below
    if (
      !/\d+/.test(key) &&
      !this.arrowKeys.includes(key) &&
      !this.removeKeys.includes(key) &&
      !this.moveKeys.includes(key) &&
      !isSelect &&
      !isCopy &&
      !isPaste &&
      !isCut &&
      !isUndo
    ) {
      event.preventDefault();
      return false;
    }

    // case 2: input's caret after separator with remove keys
    const value = this.element.value;
    const currentCaret = this.element.selectionStart;
    const previousChar = value[currentCaret - 1];
    // only move caret to previous it's position
    // if match condition below
    if (this.removeKeys.includes(key) && previousChar === this.fractionalChar) {
      const valueAtCaret = value[currentCaret];
      event.preventDefault();
      const newCaret = currentCaret - 1;
      this.element.setSelectionRange(newCaret, newCaret);
      // undefined
      if (!valueAtCaret) {
        this.insertChar(newCaret, '');
      }
      return false;
    }

    // case 3: with fractional digits > 0
    // example: [2.00|], [2.0|0], from this caret, user types number
    // note: this '|' is an represent current caret
    const fractionalPosition = value.split('').indexOf(this.fractionalChar);
    const isNumberKey = /\d/g.test(key);
    if (
      this.optional.fractionDigits > 0 &&
      fractionalPosition &&
      fractionalPosition !== -1 &&
      isNumberKey &&
      currentCaret > fractionalPosition
    ) {
      const limit = this.optional.fractionDigits + fractionalPosition;
      // without percentage
      if (!this.optional.percentage && currentCaret <= limit) {
        this.insertChar(currentCaret, key);
      }
      // validate if percentage
      if (this.optional.percentage && +value < 100 && currentCaret <= limit) {
        this.insertChar(currentCaret, key);
      }

      event.preventDefault();
      return false;
    }

    // case 4: remove keys && fractional digits > 0
    // example: [2.00|], [2.0|0], from this caret, user types backspace or delete
    // note: this '|' is an represent current caret
    const isRemoveKey = this.removeKeys.includes(key);
    if (
      this.optional.fractionDigits > 0 &&
      fractionalPosition &&
      fractionalPosition !== -1 &&
      isRemoveKey &&
      currentCaret > fractionalPosition
    ) {
      const newCaret = currentCaret - 1;
      this.insertChar(newCaret, '0');
      this.element.setSelectionRange(newCaret, newCaret);
      event.preventDefault();
      return false;
    }

    // case 5: 0|.00
    if (
      this.optional.fractionDigits &&
      isRemoveKey &&
      value[currentCaret] === this.fractionalChar &&
      !value[currentCaret - 2]
    ) {
      const values = value.split(this.fractionalChar);
      const decimalPart = +values[1];
      if (!decimalPart) {
        this.element.value = '';
        event.preventDefault();
        return false;
      }
    }

    // last case: apply format to number
    this.isNumberKey = isNumberKey;
    this.isRemoveKey = isRemoveKey;
    this.isArrowKey = this.arrowKeys.includes(key);
    this.isPaste = isPaste;
    this.isSeprator = this.separatorKeys.includes(key);

    this.currentCaret = currentCaret;
    this.priorValue = this.element.value;
  }

  private keyup(event: any) {
    if (
      !this.isNumberKey &&
      !this.isRemoveKey &&
      !this.isPaste &&
      !this.isSeprator
    )
      return;

    let value = event.target.value;
    const formatted = this.format(value);
    // model to view
    this.element.value = formatted;
    // trigger 'change' event
    const unformatted = this.unformat(formatted);
    this.dispathChangeEvent(unformatted);
    // move and remove previous it's caret
    this.keepCaretIfSeparator(formatted);
  }

  public format(value: string) {
    // case 1: config with no decimal part
    let formatted =
      this.optional.fractionDigits && this.fractionalChar === ','
        ? this.decimalPart(value)
        : this.noDecimal(value);
    // case 2: if percentage = true, it's value must be [0, 100]
    if (this.optional.percentage) {
      formatted = this.percentage(this.unformat(formatted));
    }

    return formatted;
  }

  private noDecimal(value: string) {
    let unformatted = value.replace(
      new RegExp('\\' + this.optional.separator, 'g'),
      ''
    );
    // format new value and assign to element's value
    return this.formatNumber(
      value ? Number(unformatted).toFixed(this.optional.fractionDigits) : ''
    );
  }

  private decimalPart(value: string) {
    if (value.search(this.fractionalChar) === -1) {
      const formatted = this.noDecimal(value).replace('.', this.fractionalChar);
      return formatted;
    }
    const values = value.split(this.fractionalChar);
    const integerPart = this.formatNumber(
      (values[0] as string).replace(
        new RegExp('\\' + this.optional.separator, 'g'),
        ''
      )
    ); // clear the current format;
    const decimalPart = values[1];
    return integerPart ? integerPart + this.fractionalChar + decimalPart : '';
  }

  private percentage(value: string) {
    const valueAsNumber = +value as number;

    if (valueAsNumber > 100) {
      return '100';
    }

    if (valueAsNumber < 0) {
      return '0';
    }

    return value;
  }

  private insertChar(position: number, insertValue: string) {
    this.element.setRangeText(insertValue, position, position + 1);
    this.dispathChangeEvent(this.element.value);
  }

  private formatNumber(num: string) {
    return num
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + this.optional.separator);
  }

  private unformat(value: string) {
    // unformat integer part
    let newValue = value.replace(
      new RegExp('\\' + this.optional.separator, 'g'),
      ''
    );
    // unformat decimal part
    if (this.fractionalChar === ',') {
      newValue.replace(',', '.');
    }

    return newValue;
  }

  /*
    summary: this function solves the case of current caret which is putted before the commas (,) or separator
    @param: formatted, ex: 1,200
    @param: separator can be ',' or '.'
  */
  private keepCaretIfSeparator(formatted: string) {
    if (!this.priorValue && !this.optional.fractionDigits) return;
    if (this.isNumberKey || this.isRemoveKey) {
      let diff = this.element.value.length - this.priorValue.length; // difference of # chars between before and after being formatted
      if (!this.priorValue) {
        diff -= this.optional.fractionDigits + 1;
      }
      let caret = this.currentCaret + diff; // new caret after formatted
      const currentChar = formatted.charAt(caret - 1); // commas char
      if (currentChar === this.optional.separator && this.isRemoveKey) {
        this.insertChar(caret - 2, '');
        caret -= 1;
        const char = this.element.value.charAt(caret - 2); // if this char was empty
        if (char === '') {
          this.insertChar(caret - 1, '');
          caret = 0;
        }
      }
      setTimeout(() => {
        this.element.setSelectionRange(caret, caret);
      });
    }
  }

  private dispathChangeEvent(value: string) {
    const customEvent = new CustomEvent('inputChange', { detail: value });
    this.element.dispatchEvent(customEvent);
  }
}
