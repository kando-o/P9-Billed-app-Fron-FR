/**
 * @jest-environment jsdom
 */

import {screen, waitFor, fireEvent} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js"
import router from "../app/Router.js";
import storeMock from "../__mocks__/store.js"

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy()
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe('When I click on new bills button', () => {
    test('Then I should be redirect to new bills pages', () => {
      const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }

      const billsContainer = new Bills({document, onNavigate, store: storeMock.bills(), localStorage: window.localStorage})
      const handleClickNewBill = jest.fn(billsContainer.handleClickNewBill)
      const newBillsBtn = screen.getByTestId('btn-new-bill')

      newBillsBtn.addEventListener('click', handleClickNewBill)
      fireEvent.click(newBillsBtn)

      const href = window.location.href
      const title = screen.getByText('Envoyer une note de frais')
      expect(title).toBeTruthy()
      expect(handleClickNewBill).toHaveBeenCalled()
      expect(href.includes('employee')).toBeTruthy()
      expect(href.includes('bills')).toBeTruthy()
    })
  })

  describe('When database not contains bills', () => {
    test('Then layout should not contains bills', () => {
      document.body.innerHTML = BillsUI({ data: [] })
      const iconEye = screen.queryByTestId('icon-eye')
      expect(iconEye).toBeNull()
    })
  })

  describe('When database contains bills', () => {
    test('Then layout should contains bills', () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const iconEyes = screen.queryAllByTestId('icon-eye')
      const billsLength = bills.length
      expect(billsLength).toEqual(4)
      expect(iconEyes.length).toEqual(4)
    })
  })

  describe('When I click on bills eye button', () => {
    test('Picture modal should be open', async () => {
      $.fn.modal = jest.fn()
      document.body.innerHTML = BillsUI({ data: bills })
      const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
      const billsContainer = new Bills({document, onNavigate, store: storeMock.bills(), localStorage: window.localStorage})

      const iconEye = screen.getAllByTestId('icon-eye')[0]
      const handleClickIconEyeMock = jest.fn((e) => billsContainer.handleClickIconEye(e.target))

      iconEye.addEventListener('click', handleClickIconEyeMock)
      fireEvent.click(iconEye)

      expect(handleClickIconEyeMock).toHaveBeenCalled()
      expect(screen.getAllByText('Justificatif')).toBeTruthy()
      expect(screen.getAllByTestId('modaleBill')).toBeTruthy()
    })
  })

  describe("When I am on Bills Page, but page loading", () => {
    test('Then the loading page should be rendered', () => {
      document.body.innerHTML = BillsUI({ loading: true })
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })

  describe("When I am on Bills Page, but receved an error message from server", () => {
    test('Then an error massage should be rendered', () => {
      document.body.innerHTML = BillsUI({ error: 'An error occured' })
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })

  describe('getBills function', () => {
    test('should return formatted bills', async () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const bills = new Bills({document, onNavigate, store: storeMock, localStorage: window.localStorage})
      const originalData = await bills.store.bills().list()
      
      console.log(originalData);

      const formatedBills = bills.getBills()
      // expect()
     
    });
  });
}
)

