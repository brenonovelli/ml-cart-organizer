export const INJECTED_STYLES = `
/* ML Cart Organizer - Estilos Injetados */
.ml-tag-toolbar-container {
  display: block !important;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  padding: 16px 20px;
  margin: 16px 0;
  border-left: 5px solid #ffe600;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #333333;
  width: 100%;
  box-sizing: border-box;
}

.ml-tag-toolbar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 10px;
}

.ml-tag-toolbar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #222222;
}

.ml-tag-toolbar-title-badge {
  background: #ffe600;
  color: #333333;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
  text-transform: uppercase;
}

.ml-tag-btn-toolbar,
.ml-tag-btn-reset-prices {
  background: #ffffff;
  border: 1px solid #dcdcdc;
  color: #666666;
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 11px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s ease;
  font-family: inherit;
  font-weight: 500;
}

.ml-tag-btn-toolbar:hover,
.ml-tag-btn-reset-prices:hover {
  background: #f5f5f5;
  color: #222222;
  border-color: #bbbbbb;
}

.ml-tag-subtotal-box {
  background: #f0f7ff;
  border: 1px solid #cce3fd;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 13px;
  color: #0056b3;
  display: flex;
  align-items: center;
  gap: 6px;
}

.ml-tag-subtotal-box strong {
  font-size: 15px;
  color: #004085;
}

.ml-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.ml-tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #dcdcdc;
  background: #f5f5f5;
  color: #444444;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
  user-select: none;
  outline: none;
}

.ml-tag-pill:hover {
  background: #ebebeb;
  border-color: #bbbbbb;
}

.ml-tag-pill.active {
  background: #3483fa;
  border-color: #3483fa;
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(52, 131, 250, 0.3);
}

.ml-tag-pill .pill-count {
  background: rgba(0, 0, 0, 0.08);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
}

.ml-tag-pill.active .pill-count {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

/* Botão de excluir tag dentro do pill */
.ml-tag-delete-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-left: 2px;
  font-size: 13px;
  line-height: 1;
  opacity: 0.45;
  transition: opacity 0.15s, background-color 0.15s, color 0.15s;
  cursor: pointer;
}

.ml-tag-delete-btn:hover {
  opacity: 1;
  background-color: rgba(217, 56, 56, 0.15);
  color: #d93838;
}

.ml-tag-pill.active .ml-tag-delete-btn {
  opacity: 0.75;
  color: #ffffff;
}

.ml-tag-pill.active .ml-tag-delete-btn:hover {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.35);
  color: #ffffff;
}

.ml-tag-btn-add {
  background: #ffffff;
  border: 1px dashed #3483fa;
  color: #3483fa;
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 12px;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: background-color 0.15s ease;
}

.ml-tag-btn-add:hover {
  background: #eef5ff;
}

/* Wrapper do card ajustado para acomodar o footer sem interferir no grid interno */
.ml-card-wrapped-container {
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.ml-card-wrapped-container .cl-item-card__two-columns-layout {
  min-height: 112px !important;
}

/* FOOTER DENTRO DO CARD DO PRODUTO */
.ml-item-tag-widget {
  width: 100% !important;
  box-sizing: border-box !important;
  margin-top: 14px !important;
  margin-bottom: 0 !important;
  padding: 8px 12px 0 12px !important;
  border-top: 1px solid #ddd !important;
  background: #ffffff !important;
  border-radius: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  flex-wrap: wrap !important;
  gap: 8px !important;
  clear: both !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  position: relative !important;
  z-index: 2 !important;
}

.ml-item-tags-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.ml-item-tags-label {
  font-size: 11px;
  color: #666666;
  font-weight: 400 !important;
  margin-right: 2px;
}

.ml-item-chip {
  background: transparent !important;
  color: #1a66cc !important;
  font-size: 11px;
  font-weight: 400 !important;
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid #cce3fd !important;
}

.ml-item-chip .remove-tag {
  cursor: pointer;
  opacity: 0.6;
  font-weight: normal !important;
  font-size: 13px;
  line-height: 1;
}

.ml-item-chip .remove-tag:hover {
  opacity: 1;
  color: #d93838;
}

.ml-item-add-tag-trigger {
  font-size: 11px;
  color: #1a66cc !important;
  background: #e9f2fe !important;
  border: 1px solid #cce3fd !important;
  border-radius: 12px;
  padding: 2px 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  transition: background-color 0.15s ease;
  font-weight: 400 !important;
}

.ml-item-add-tag-trigger:hover {
  background: #d8e8fc !important;
}

/* Badge de Histórico de Preço */
.ml-price-badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.ml-price-down {
  background: #e6f9ed;
  color: #008744;
  border: 1px solid #b7ebd0;
}

.ml-price-up {
  background: #fdf0ed;
  color: #d93838;
  border: 1px solid #fbd2cb;
}

.ml-price-same {
  background: #f4f4f4;
  color: #777777;
  border: 1px solid #e2e2e2;
}

/* Popover Dropdown */
.ml-tag-popover {
  position: absolute;
  background: #ffffff;
  border: 1px solid #dcdcdc;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  border-radius: 8px;
  padding: 12px;
  z-index: 999999;
  min-width: 230px;
  width: max-content;
  max-width: 340px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  font-size: 13px;
  box-sizing: border-box;
}

.ml-tag-popover-list {
  flex: 1;
  max-height: calc(85vh - 90px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-right: 2px;
}

.ml-tag-popover-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.1s ease;
}

.ml-tag-popover-item:hover {
  background: #f5f5f5;
}

.ml-tag-popover-input-row {
  margin-top: 8px;
  display: flex;
  gap: 4px;
  padding-top: 6px;
  border-top: 1px solid #eeeeee;
}

.ml-tag-popover-input {
  flex: 1;
  padding: 4px 6px;
  font-size: 11px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.ml-tag-popover-btn {
  padding: 4px 8px;
  font-size: 11px;
  background: #3483fa;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* Ocultação de cards e de grupos vazios */
.ml-cart-item-hidden {
  display: none !important;
}

.ml-cart-group-hidden {
  display: none !important;
}

/* Botão flutuante para reativar o organizador quando pausado */
.ml-tag-floating-enable-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 99999;
  background: #ffffff;
  color: #3483fa;
  border: 1px solid #3483fa;
  border-radius: 24px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  transition: all 0.2s ease;
}

.ml-tag-floating-enable-btn:hover {
  background: #3483fa;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(52, 131, 250, 0.35);
}
`;
