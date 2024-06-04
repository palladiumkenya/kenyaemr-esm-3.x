import React, { useState } from 'react';
import {
  ButtonSet,
  Button,
  RadioButtonGroup,
  RadioButton,
  Search,
  Table,
  TableHead,
  TableBody,
  TableHeader,
  TableRow,
  TableCell,
} from '@carbon/react';
import styles from './billing-form.scss';
import { useTranslation } from 'react-i18next';
import { useFetchSearchResults, processBillItems } from '../billing.resource';
import { getPatientUuidFromUrl } from '@openmrs/esm-patient-common-lib';
import { showSnackbar } from '@openmrs/esm-framework';
import { mutate } from 'swr';

type BillingFormProps = {
  patientUuid: string;
  closeWorkspace: () => void;
};

const BillingForm: React.FC<BillingFormProps> = ({ closeWorkspace }) => {
  const { t } = useTranslation();
  const patientUuid = getPatientUuidFromUrl();

  const [GrandTotal, setGrandTotal] = useState(0);

  const [searchOptions, setsearchOptions] = useState([]);
  const [defaultSearchItems, setdefaultSearchItems] = useState([]);

  const [BillItems, setBillItems] = useState([]);

  const [searchVal, setsearchVal] = useState('');
  const [category, setCategory] = useState('');

  const toggleSearch = (choiceSelected) => {
    (document.getElementById('searchField') as HTMLInputElement).disabled = false;

    if (choiceSelected == 'Stock Item') {
      setCategory('Stock Item');
    } else {
      setCategory('Service');
    }
  };

  const calculateTotal = (event, itemName) => {
    const Qnty = event.target.value;
    const price = (document.getElementById(event.target.id + 'Price') as HTMLInputElement).innerHTML;
    const total = parseInt(price) * Qnty;
    (document.getElementById(event.target.id + 'Total') as HTMLInputElement).innerHTML = total.toString();

    const updateItem = BillItems.filter((o) => o.Item.toLowerCase().includes(itemName.toLowerCase()));

    updateItem.map((o) => (o.Qnty = Qnty));
    updateItem.map((o) => (o.Total = total));

    const totals = Array.from(document.querySelectorAll('[id$="Total"]'));

    let addUpTotals = 0;
    totals.forEach((tot) => {
      var getTot = (tot as HTMLInputElement).innerHTML;
      addUpTotals += parseInt(getTot);
    });
    setGrandTotal(addUpTotals);
  };

  const CalculateTotalAfteraddBillItem = () => {
    let sum = 0;
    BillItems.map((o) => (sum += o.Price));

    setGrandTotal(sum);
  };

  const addItemToBill = (event, itemid, itemname, itemcategory, itemPrice) => {
    BillItems.push({
      uuid: itemid,
      Item: itemname,
      Qnty: 1,
      Price: itemPrice,
      Total: itemPrice,
      category: itemcategory,
    });
    setBillItems(BillItems);
    setsearchOptions([]);
    CalculateTotalAfteraddBillItem();
    (document.getElementById('searchField') as HTMLInputElement).value = '';
  };

  //  filter items
  const { data, error, isLoading, isValidating } = useFetchSearchResults(searchVal, category);

  const filterItems = (val) => {
    setsearchVal(val);

    if (isLoading) {
    } else {
      if (typeof data !== 'undefined') {
        //set to null then repopulate
        while (searchOptions.length > 0) {
          searchOptions.pop();
        }

        const res = data as { results: any[] };

        res.results.map((o) => {
          if (o.commonName && (o.commonName != '' || o.commonName != null)) {
            searchOptions.push({
              uuid: o.uuid,
              Item: o.commonName,
              Qnty: 1,
              Price: 10,
              Total: 10,
              category: 'StockItem',
            });
          } else {
            if (o.name.toLowerCase().includes(searchVal.toLowerCase())) {
              searchOptions.push({
                uuid: o.uuid,
                Item: o.name,
                Qnty: 1,
                Price: o.servicePrices[0].price,
                Total: o.servicePrices[0].price,
                category: 'Service',
              });
            }
          }
          setsearchOptions(searchOptions);
        });
      }
    }
  };

  const postBillItems = () => {
    const bill = {
      cashPoint: '54065383-b4d4-42d2-af4d-d250a1fd2590',
      cashier: 'f9badd80-ab76-11e2-9e96-0800200c9a66',
      lineItems: [],
      payments: [],
      patient: patientUuid,
      status: 'PENDING',
    };

    BillItems.map((o) => {
      if (o.category == 'StockItem') {
        bill.lineItems.push({
          item: o.uuid,
          quantity: parseInt(o.Qnty),
          price: o.Price,
          priceName: 'Default',
          priceUuid: '7b9171ac-d3c1-49b4-beff-c9902aee5245',
          lineItemOrder: 0,
          paymentStatus: 'PENDING',
        });
      } else {
        bill.lineItems.push({
          billableService: o.uuid,
          quantity: parseInt(o.Qnty),
          price: o.Price,
          priceName: 'Default',
          priceUuid: '7b9171ac-d3c1-49b4-beff-c9902aee5245',
          lineItemOrder: 0,
          paymentStatus: 'PENDING',
        });
      }
    });

    const url = `/ws/rest/v1/cashier/bill`;
    processBillItems(bill).then(
      (resp) => {
        closeWorkspace();
        mutate((key) => typeof key === 'string' && key.startsWith(url), undefined, { revalidate: true });
        showSnackbar({
          title: t('billItems', 'Save Bill'),
          subtitle: 'Bill processing has been successful',
          kind: 'success',
          timeoutInMs: 3000,
        });
      },
      (error) => {
        showSnackbar({ title: 'Bill processing error', kind: 'error', subtitle: error });
      },
    );
  };

  return (
    <div className={styles.billingFormContainer}>
      <RadioButtonGroup
        legendText={t('selectCategory', 'Select category')}
        name="radio-button-group"
        defaultSelected="radio-1"
        className={styles.billingItem}
        onChange={toggleSearch}>
        <RadioButton labelText={t('stockItem', 'Stock Item')} value="Stock Item" id="radio-1" />
        <RadioButton labelText={t('service', 'Service')} value="Service" id="radio-2" />
      </RadioButtonGroup>
      <div></div>

      <div>
        <Search
          id="searchField"
          size="lg"
          placeholder="Find your drugs here..."
          labelText="Search"
          disabled
          closeButtonLabelText="Clear search input"
          onChange={() => {}}
          className={styles.billingItem}
          onKeyUp={(e) => {
            filterItems(e.target.value);
          }}
        />

        <ul className={styles.searchContent}>
          {searchOptions.map((row) => (
            <li className={styles.searchItem}>
              <Button
                id={row.uuid}
                onClick={(e) => addItemToBill(e, row.uuid, row.Item, row.category, row.Price)}
                style={{ background: 'inherit', color: 'black' }}>
                {row.Item} Qnty.{row.Qnty} Ksh.{row.Price}
              </Button>
            </li>
          ))}
        </ul>
      </div>

      {/* <NumberInput id="carbon-number" min={0} max={100} value={50} ref={numberRef}
      onChange={(e)=> alert((numberRef.current as HTMLInputElement).value)} 
      className="testingNumberInput" label="NumberInput label" helperText="Optional helper text." invalidText="Number is not valid" /> */}

      <Table aria-label="sample table" className={styles.billingItem}>
        <TableHead>
          <TableRow>
            <TableHeader>Item</TableHeader>
            <TableHeader>Quantity</TableHeader>
            <TableHeader>Price</TableHeader>
            <TableHeader>Total</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {BillItems && Array.isArray(BillItems) ? (
            BillItems.map((row) => (
              <TableRow>
                <TableCell>{row.Item}</TableCell>
                <TableCell>
                  <input
                    type="number"
                    className="form-control"
                    id={row.Item}
                    min={0}
                    max={100}
                    value={row.Qnty}
                    onChange={(e) => {
                      calculateTotal(e, row.Item);
                      row.Qnty = e.target.value;
                    }}
                  />
                  {/* <NumberInput id={row.Item} min={0} max={100} value={row.Qnty} ref={numberRef}
                    onChange={(e)=> alert((numberRef.current as HTMLInputElement).value)} /> */}
                </TableCell>
                <TableCell id={row.Item + 'Price'}>{row.Price}</TableCell>
                <TableCell id={row.Item + 'Total'} className="totalValue">
                  {row.Total}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <p>Loading...</p>
          )}
          <TableRow>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell style={{ fontWeight: 'bold' }}>Grand Total:</TableCell>
            <TableCell id="GrandTotalSum">{GrandTotal}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <ButtonSet className={styles.billingItem}>
        <Button kind="secondary" onClick={closeWorkspace}>
          Discard
        </Button>
        <Button kind="primary" onClick={postBillItems}>
          Save & Close
        </Button>
      </ButtonSet>
    </div>
  );
};

export default BillingForm;
