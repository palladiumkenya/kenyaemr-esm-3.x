import React, {useState,useEffect} from 'react';
import { TextInput,NumberInput,RadioButtonGroup, RadioButton, Search, Table,TableHead,TableBody,TableHeader,TableRow,TableCell } from '@carbon/react';
import styles from './billing-form.scss';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';


type BillingFormProps = {
  patientUuid: string;
};


const BillingForm: React.FC<BillingFormProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  // const isTablet = useLayoutType() === 'tablet';
  // const [isSubmittingForm, setIsSubmittingForm] = React.useState(false);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [GrandTotal, setGrandTotal] = useState(0);

  const rows = [
    {'Item':'Panadol','Qnty':20, 'Price':10, 'Total':10},
    {'Item':'Vaccine','Qnty':20, 'Price':10, 'Total':10},
    {'Item':'Gloves','Qnty':20, 'Price':10, 'Total':10},
    {'Item':'Syringe','Qnty':20, 'Price':10, 'Total':10}

  ];

  const toggleSearch = (choiceSelected) => {
    // alert(JSON.stringify(event));
    console.log(choiceSelected, choiceSelected == 'Drug');
    var isSelected = choiceSelected == 'Drug'
    setIsSearchEnabled(true)
    // if (choiceSelected == 'Drug'){
    //   setIsSearchEnabled(true)
    //   console.log('in choice', isSearchEnabled);

    // }else{
    //   setIsSearchEnabled(false)
    // }
    console.log(choiceSelected, isSearchEnabled);

  };


  const calculateTotal = (event) => {
 
    const price =   (document.getElementById(event.target.id+"Price")  as HTMLInputElement).value;
    const total = parseInt(price) * event.target.value;
    console.log(price, total);

    // (document.getElementById(event.target.id+"Total")  as HTMLInputElement).value = total.toString();
    (document.getElementById(event.target.id+"Total")  as HTMLInputElement).innerHTML = total.toString();

    
    // add totals
    // const totals =   Array.from(document.getElementsByClassName("totalValue"));
    const totals = Array.from( document.querySelectorAll('[id$="Total"]'));
    // totals.foreach()
    console.log(totals)
    let addUpTotals = 0;
    totals.forEach ((tot)=> {
      var getTot = (tot as HTMLInputElement).innerHTML;
      console.log(getTot);
      addUpTotals+=parseInt(getTot)
  })
  setGrandTotal(addUpTotals)


  };

  useEffect(() => {
    // action on update of movies
}, []);


  return (
    <div className={styles.billingFormContainer}>
      <RadioButtonGroup
        legendText={t('selectCategory', 'Select category')}
        name="radio-button-group"
        defaultSelected="radio-1" className={styles.billingItem} onChange={toggleSearch}>
        <RadioButton labelText={t('drug', 'Drug')} value="Drug" id="radio-1" />
        <RadioButton labelText={t('nonDrug', 'Non drug')} value="Non Drug" id="radio-2" />
      </RadioButtonGroup>
      <div>
        
      </div>
      

      <Search size="lg" placeholder="Find your drugs here..." labelText="Search" 
      closeButtonLabelText="Clear search input" id="search-1" onChange={() => {}} onKeyDown={() => {}} 
      className={styles.billingItem} disabled={{isSearchEnabled}}/>

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

          { rows && Array.isArray(rows) ? rows.map((row) => ( 
          <TableRow>
            <TableCell>{row.Item}</TableCell>
            <TableCell><NumberInput id={row.Item} min={0} max={100} value={row.Qnty} onChange={(e) => calculateTotal(e)}/></TableCell> 
            <TableCell><TextInput id={row.Item+"Price"} type="text" readonly value={row.Price} style={{padding:'0px',background: 'inherit'}}/></TableCell>      
            <TableCell id={row.Item+"Total"}  className="totalValue">{row.Total}</TableCell>    
          </TableRow>
            )) : (
                <p>Loading...</p>
            )
          }
           <TableRow>
            <TableCell></TableCell>
            <TableCell></TableCell> 
            <TableCell>Grand Total :</TableCell>      
            <TableCell><TextInput id="GrandTotalSum" type="text" readonly value={GrandTotal} style={{padding:'0px',background: 'inherit'}} /></TableCell>    
          </TableRow>
        </TableBody>
      </Table>
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
