import useSWR from 'swr'
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
import { openmrsFetch} from '@openmrs/esm-framework';
// import { fetchRes } from '../billing.resource';
import { processBillItems } from '../billing.resource';
import { navigate, showSnackbar } from '@openmrs/esm-framework';






type BillingFormProps = {
  patientUuid: string;
  closeWorkspace: () => void;
};

const BillingForm: React.FC<BillingFormProps> = ({ patientUuid,closeWorkspace }) => {
  const { t } = useTranslation();
  
  const [GrandTotal, setGrandTotal] = useState(0);
  
  const [searchOptions, setsearchOptions] = useState([]);
  const [defaultSearchItems, setdefaultSearchItems] = useState([]);

  const [BillItems, setBillItems] = useState([]);
  const [FinalBill, setFinalBill] = useState({});

  const [searchVal, setsearchVal] = useState("");

  const toggleSearch = (choiceSelected) => {
    if (choiceSelected == 'Stock Item') {
      (document.getElementById('searchField') as HTMLInputElement).disabled = false;
    } else {
      (document.getElementById('searchField') as HTMLInputElement).disabled = true;
    }
  };

  const calculateTotal = (event, itemName) => {
    const Qnty = event.target.value;
    const price = (document.getElementById(event.target.id + 'Price') as HTMLInputElement).value;
    const total = parseInt(price) * Qnty;
    (document.getElementById(event.target.id + 'Total') as HTMLInputElement).innerHTML = total.toString();

    const totals = Array.from(document.querySelectorAll('[id$="Total"]'));

    const updateQnty = BillItems.filter((o) =>
      o.Item.toLowerCase().includes(itemName.toLowerCase()),
    );

    updateQnty.map((o) =>
      o.Qnty = Qnty
    );

    // setBillItems()
    console.log("BillItems ",BillItems)
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

  const addItemToBill = (event, itemid, itemname) => {
    // const filteredRes = defaultSearchItems.filter((o) =>
    //   o.Item.toLowerCase().includes(item.target.id.replace('Option', '').toLowerCase()),
    // );
  
    BillItems.push({ uuid: itemid, Item: itemname, Qnty: 1, Price: 10, Total: 10 });
    setBillItems(BillItems);
    setsearchOptions([]);
    CalculateTotalAfteraddBillItem();
  };


//  filter items
  const { data, error, isLoading, isValidating  } = useSWR(searchVal ?`/ws/rest/v1/stockmanagement/stockitem?v=default&limit=10&q=${searchVal}`:null,openmrsFetch, {});

  const filterItems = (val) => {
      setsearchVal(val)
   
    if (isLoading){
      console.log("loading")
    }else{
       if(typeof data !== 'undefined'){
        //set to null then repopulate
        while(searchOptions.length > 0) {
            searchOptions.pop();
        }
      
        const res = data.data as { results: any[] }; 
        
        res.results.map((o) => {
            if (o.commonName != ""  || o.commonName !=null){
              searchOptions.push({uuid: o.uuid, Item: o.commonName, Qnty: 1, Price: 10, Total: 10 })
              setsearchOptions(searchOptions)
            }
        }); 

      }         
                
    }
  }

  const postBillItems = () => {
    const bill ={
      cashPoint: "54065383-b4d4-42d2-af4d-d250a1fd2590",
      cashier: "f9badd80-ab76-11e2-9e96-0800200c9a66",
      lineItems: [],
      payments: [],
      patient: patientUuid,
      status: "PENDING"
   }

    // let newlineItems = []

    BillItems.map((o) => {
      bill.lineItems.push({
          item: o.uuid,
          quantity: 24,
          price: 240.00,
          priceName: "Default",
          priceUuid: "7b9171ac-d3c1-49b4-beff-c9902aee5245",
          lineItemOrder: 0,
          paymentStatus: "PENDING"
        })    
        
      }); 

      console.log("get ill => ", bill)
    // bill.lineItems = newlineItems;
    // setFinalBill(bill);
    // console.log("FinalBill => ", FinalBill)
    const url = `/ws/rest/v1/cashier/bill`;
    processBillItems(bill).then(
      (resp) => {
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

  useEffect(() => {
      // action on update of movies
  }, [FinalBill]);


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
                onClick={(e) => addItemToBill(e, row.uuid, row.Item)}
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
                      calculateTotal(e, row.Item);
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
        <Button kind="secondary" onClick={closeWorkspace}>Discard</Button>
        <Button kind="primary" onClick={postBillItems}>Save</Button>
      </ButtonSet>
      
    </div>
  );
};

export default BillingForm;
