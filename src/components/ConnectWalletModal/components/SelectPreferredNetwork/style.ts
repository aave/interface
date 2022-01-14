import css from 'styled-jsx/css';

/*language=SCSS*/
const staticStyles = css.global`
  @import 'src/_mixins/vars';
  @import 'src/_mixins/screen-size';

  .SelectPreferredNetwork {
    position: relative;
    z-index: 5;
    margin-bottom: 35px;
    margin-top: -20px;
    @include respond-to(xl) {
      margin-top: -10px;
      margin-bottom: 30px;
    }
    @include respond-to(sm) {
      margin-bottom: 25px;
    }

    &__title {
      font-size: $medium;
      margin-bottom: 5px;
      @include respond-to(xl) {
        font-size: $small;
      }
    }

    .DropdownWrapper__content {
      width: 100%;
    }

    &__select {
      font-weight: 300;
      font-size: $medium;
      padding: 6px 30px;
      border-radius: $borderRadius;
      min-width: 220px;
      border: 1px solid transparent;
      transition: $transition;
      box-shadow: $boxShadow;
      @include respond-to(xl) {
        min-width: 180px;
        font-size: $small;
      }
      @include respond-to(sm) {
        padding: 8px;
        min-width: 260px;
        font-size: $medium;
      }
      span {
        text-transform: capitalize;
      }
    }

    &__select-arrow {
      position: absolute;
      right: 10px;
      top: calc(50% + 1px);
      transform: translateY(-50%);
    }

    &__option {
      width: 100%;
      font-size: $medium;
      font-weight: 300;
      text-transform: capitalize;
      position: relative;
      padding: 12px 5px;
      @include respond-to(xl) {
        font-size: $small;
      }
      @include respond-to(sm) {
        font-size: $medium;
      }
      &:after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 1px;
        opacity: 0.1;
      }
      &:last-of-type {
        &:after {
          display: none;
        }
      }
    }
  }
`;

export default staticStyles;
