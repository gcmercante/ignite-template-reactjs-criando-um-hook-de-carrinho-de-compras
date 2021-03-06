import React from "react";
import { Link } from "react-router-dom";
import { MdShoppingBasket } from "react-icons/md";

import logo from "../../assets/images/logo.svg";
import { Container, Cart } from "./styles";
import { useCart } from "../../hooks/useCart";

interface CartItemsAmount {
  [key: number]: number;
}

const Header = (): JSX.Element => {
  const { cart } = useCart();
  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    sumAmount[product.id] += 1;

    return sumAmount;
  }, {} as CartItemsAmount);

  const cartSize = Object.keys(cartItemsAmount).length;

  return (
    <Container>
      <Link to="/">
        <img src={logo} alt="Rocketshoes" />
      </Link>

      <Cart to="/cart">
        <div>
          <strong>Meu carrinho</strong>
          <span data-testid="cart-size">
            {cartSize === 1 ? `${cartSize} item` : `${cartSize} itens`}
          </span>
        </div>
        <MdShoppingBasket size={36} color="#FFF" />
      </Cart>
    </Container>
  );
};

export default Header;
