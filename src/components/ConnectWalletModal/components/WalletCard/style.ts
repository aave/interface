import css from 'styled-jsx/css';

/*language=SCSS*/
const staticStyles = css`
  @import 'src/_mixins/vars';
  @import 'src/_mixins/screen-size';

  .WalletCard {
    position: relative;
    margin: 5px;
    &:after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      filter: blur(4px);
      border-radius: $borderRadius;
      transition: $transition;
    }
    &:disabled {
      box-shadow: none !important;
      &:after {
        display: none;
      }
      &:active {
        .WalletCard__image-inner {
          img {
            transform: scale(1);
          }
        }
      }
    }
    &:active {
      .WalletCard__image-inner {
        img {
          transform: scale(0.95);
        }
      }
    }

    &__error {
      font-size: $extraSmall;
      font-weight: 400;
      position: absolute;
      bottom: calc(100% + 5px);
      left: 0;
    }

    &__inner {
      width: 130px;
      height: 90px;
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: $borderRadius;
      box-shadow: $boxShadow;
      transition-property: box-shadow;
      transition-duration: 0.2s;
      transition-timing-function: ease;
      border: 1px solid transparent;
      padding: 17px 8px 8px;
      @include respond-to(lg) {
        height: 80px;
        padding: 8px 4px 4px;
        justify-content: space-around;
      }
      @include respond-to(md) {
        flex-direction: row;
        justify-content: flex-start;
        width: 260px;
        height: 60px;
        padding: 10px;
      }
    }

    &__image-inner {
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: auto;
      @include respond-to(lg) {
        margin: 0px;
      }
      @include respond-to(md) {
        width: 35px;
        margin: 0;
      }
      img {
        max-width: 30px;
        max-height: 30px;
        transform: scale(1);
        transition: $transition;
        @include respond-to(md) {
          max-width: 35px;
          max-height: 35px;
        }
      }
    }

    &__text-inner {
      text-align: center;
      p {
        font-size: $medium;
        font-weight: 300;
        text-align: center;
        @include respond-to(lg) {
          font-size: $small;
        }
        @include respond-to(md) {
          font-size: $medium;
        }
      }
      @include respond-to(md) {
        width: 100%;
      }
      span {
        display: inline-block;
        font-weight: 300;
        font-size: 8px;
        @include respond-to(md) {
          font-size: $extraSmall;
        }
      }
    }
  }
`;

// @ts-ignore
export default staticStyles;
