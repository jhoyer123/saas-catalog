import { DeleteModal } from "@/components/shared/DeleteAlert";
import { OfferModal } from "./OfferModal";
import type { ModalType } from "@/hooks/products/useModalsProduct";
import type { ProductCatalog } from "@/types/product.types";

interface ModalState {
  type: ModalType | null;
  product: ProductCatalog | null;
  open: boolean;
}

interface Props {
  modalState: ModalState;
  onClose: () => void;
  onConfirmDelete: (product: ProductCatalog) => void;
  onConfirmOffer: (product: ProductCatalog) => void;
}

const ModalProduct = ({ modalState, onClose, onConfirmDelete }: Props) => {
  return (
    <>
      {/* Modal eliminar */}
      {modalState.type === "delete" && modalState.product && (
        <DeleteModal
          title="Eliminar Producto"
          description={
            <>
              ¿Estás seguro de que deseas eliminar el producto{" "}
              <strong>{modalState.product.name}</strong>? Esta acción no se
              puede deshacer.
            </>
          }
          open={modalState.open}
          onOpenChange={(open) => {
            if (!open) onClose();
          }}
          onConfirm={() => {
            onConfirmDelete(modalState.product!);
            onClose();
          }}
        />
      )}

      {/* Modal oferta */}
      {modalState.type === "offer" && modalState.product && (
        <OfferModal
          open={modalState.open}
          product={modalState.product}
          onClose={onClose}
        />
      )}
    </>
  );
};

export default ModalProduct;
