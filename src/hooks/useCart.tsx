import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const { data: stock }: { data: Stock } = await api.get(
        `/stock/${productId}`
      );

      const existsInCart = cart.find((product) => product.id === productId);

      if (existsInCart) {
        if (stock.amount < existsInCart.amount + 1) {
          toast.error("Quantidade solicitada fora de estoque");
          return;
        }

        const updatedCart = cart.map((product) => {
          if (product.id === productId) {
            product.amount += 1;
          }

          return product;
        });

        localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));

        setCart(updatedCart);
      } else {
        const product = await api.get(`/products/${productId}`);

        if (product) {
          product.data.amount = 1;

          localStorage.setItem(
            "@RocketShoes:cart",
            JSON.stringify([...cart, product.data])
          );

          setCart([...cart, product.data]);
        }
      }
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productIndex = cart.findIndex(
        (product) => product.id === productId
      );

      if (productIndex >= 0) {
        const updatedCart = cart.filter((product) => product.id !== productId);

        localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));

        setCart(updatedCart);
      } else {
        throw Error();
      }
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount > 0) {
        const { data: stock }: { data: Stock } = await api.get(
          `/stock/${productId}`
        );
        const productToUpdate = cart.find(
          (product) => product.id === productId
        );

        if (productToUpdate) {
          if (stock.id === productId && stock.amount < amount) {
            toast.error("Quantidade solicitada fora de estoque");
            return;
          }
        }

        const updatedCart = cart.map((product) => {
          if (product.id === productId) {
            product.amount = amount;
          }

          return product;
        });

        localStorage.setItem(
          "@RocketShoes:cart",
          JSON.stringify([...updatedCart])
        );

        setCart([...updatedCart]);
      }
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
