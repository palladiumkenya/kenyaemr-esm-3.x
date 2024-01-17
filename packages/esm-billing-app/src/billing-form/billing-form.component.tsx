import React, { useState, useEffect } from 'react';
import {
  ButtonSet,
  Button,
  TextInput,
  NumberInput,
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

type BillingFormProps = {
  patientUuid: string;
};

const BillingForm: React.FC<BillingFormProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  // const isTablet = useLayoutType() === 'tablet';
  // const [isSubmittingForm, setIsSubmittingForm] = React.useState(false);
  const [GrandTotal, setGrandTotal] = useState(0);

  const defaultSearchItems = [
    { Item: 'Paracetamol ', Qnty: 20, Price: 10, Total: 10 },
    { Item: 'Pfizer Vaccine', Qnty: 50, Price: 10, Total: 10 },
    { Item: 'GoodHealth Probiotics', Qnty: 20, Price: 10, Total: 10 },
    { Item: 'Cipex Dewormer', Qnty: 70, Price: 10, Total: 10 },
  ];

  const [searchOptions, setsearchOptions] = useState([]);
  const [BillItems, setBillItems] = useState([]);

  const toggleSearch = (choiceSelected) => {
    // setIsSearchEnabled("disabled")
    if (choiceSelected == 'Stock Item') {
      // setIsSearchEnabled("disabled")
      (document.getElementById('searchField') as HTMLInputElement).disabled = false;
    } else {
      // setIsSearchEnabled("")
      (document.getElementById('searchField') as HTMLInputElement).disabled = true;
    }
  };

  const calculateTotal = (event) => {
    const price = (document.getElementById(event.target.id + 'Price') as HTMLInputElement).value;
    const total = parseInt(price) * event.target.value;
    // (document.getElementById(event.target.id+"Total")  as HTMLInputElement).value = total.toString();
    (document.getElementById(event.target.id + 'Total') as HTMLInputElement).innerHTML = total.toString();

    // add totals
    const totals = Array.from(document.querySelectorAll('[id$="Total"]'));

    let addUpTotals = 0;
    totals.forEach((tot) => {
      var getTot = (tot as HTMLInputElement).innerHTML;
      addUpTotals += parseInt(getTot);
    });
    setGrandTotal(addUpTotals);
  };

  const CalculateTotalAfteraddBillItem = () => {
    // add totals
    let sum = 0;
    BillItems.map((o) => (sum += o.Price));

    setGrandTotal(sum);
  };

  const filterItems = (searchVal) => {
    if (searchVal != '') {
      const filteredRes = defaultSearchItems.filter((o) => o.Item.toLowerCase().includes(searchVal.toLowerCase()));

      setsearchOptions(filteredRes);
    } else {
      setsearchOptions([]);
    }
  };

  const addItemToBill = (item) => {
    const filteredRes = defaultSearchItems.filter((o) =>
      o.Item.toLowerCase().includes(item.target.id.replace('Option', '').toLowerCase()),
    );

    BillItems.push({ Item: filteredRes[0].Item, Qnty: 1, Price: filteredRes[0].Price, Total: 10 });
    setBillItems(BillItems);
    setsearchOptions([]);
    CalculateTotalAfteraddBillItem();
  };

  useEffect(() => {
    // action on update of movies
  }, []);

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
                id={row.Item + 'Option'}
                onClick={(e) => addItemToBill(e)}
                style={{ background: 'inherit', color: 'black' }}>
                {row.Item} Qnty.{row.Qnty} Ksh.{row.Price}
              </Button>
            </li>
          ))}
        </ul>
      </div>

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
                  <NumberInput
                    id={row.Item}
                    min={0}
                    max={100}
                    value={row.Qnty}
                    onChange={(e) => {
                      calculateTotal(e);
                      row.Qnty = e.target.value;
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextInput
                    id={row.Item + 'Price'}
                    type="text"
                    readonly
                    value={row.Price}
                    style={{ padding: '0px', background: 'inherit' }}
                  />
                </TableCell>
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
            <TableCell>Grand Total:</TableCell>
            <TableCell>
              <TextInput
                id="GrandTotalSum"
                type="text"
                readonly
                value={GrandTotal}
                style={{ padding: '0px', background: 'inherit' }}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <ButtonSet className={styles.billingItem}>
        <Button kind="secondary">Discard</Button>
        <Button kind="primary">Save</Button>
      </ButtonSet>
      {/* <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
            <Button className={styles.button} kind="secondary" >
              {t('cancel', 'Cancel')}
            </Button>
            <Button className={styles.button} disabled={isSubmittingForm} kind="primary" type="submit">
              {isSubmittingForm ? (
                <InlineLoading className={styles.spinner} description={t('saving', 'Saving') + '...'} />
              ) : (
                <span>{t('saveAndClose', 'Save & close')}</span>
              )}
            </Button>
      </ButtonSet> */}
    </div>
  );
};

export default BillingForm;
