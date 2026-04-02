package handler

import (
	"net/http"

	"caffe-dalley-backend/internal/dto"
	"caffe-dalley-backend/internal/service"
	"caffe-dalley-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type UnitHandler struct {
	unitService service.UnitService
}

func NewUnitHandler(unitService service.UnitService) *UnitHandler {
	return &UnitHandler{unitService}
}

func (h *UnitHandler) Create(c *gin.Context) {
	var req dto.CreateUnitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	if err := h.unitService.CreateUnit(req); err != nil {
		response.Error(c, http.StatusBadRequest, "Failed to create unit", err.Error())
		return
	}

	response.Success(c, http.StatusCreated, "Unit created successfully", nil)
}

func (h *UnitHandler) FindAll(c *gin.Context) {
	units, err := h.unitService.GetUnits()
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch units", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Units fetched successfully", units)
}

func (h *UnitHandler) FindByID(c *gin.Context) {
	id := c.Param("id")
	unit, err := h.unitService.GetUnitByID(id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Unit not found", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Unit fetched successfully", unit)
}

func (h *UnitHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateUnitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	if err := h.unitService.UpdateUnit(id, req); err != nil {
		response.Error(c, http.StatusBadRequest, "Failed to update unit", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Unit updated successfully", nil)
}

func (h *UnitHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.unitService.DeleteUnit(id); err != nil {
		response.Error(c, http.StatusBadRequest, "Failed to delete unit", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Unit deleted successfully", nil)
}
