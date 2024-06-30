import React from 'react';
import '../App.css';

const MapInformation = ({ onClose }) => {
  return (
    <>
      <div className="map-info-overlay" onClick={onClose}></div>
      <div className="map-info-container">
        <div className="info-header">
          <h2>Karttasovelluksen käyttö</h2>
          <p>Kartan on suunnitellut ja toteuttanut <b>Otto Tuhkunen 2024</b></p>
          <p style={{color : 'darkred'}}>Kartta ei ole navigointikäyttöön, eikä se täytä asianmukaisen merikartan vaatimuksia.</p>
          <p><b>⚠️ Vesikivet ja syvyyskäyrät näkyvät kartalla vain Porvoon eteläpuolella!</b></p>
          <ul style={{textAlign : 'left'}}>
            <li>Lähteet ovat lueteltuna sovelluksen oikeassa alareunassa. Jos käytät puhelinta, paina (i) symbolia.</li>
            <li>Emme kerää käyttäjältä dataa. Sovellus ei käytä evästeitä.</li>
          </ul>
          <button className="close-button" onClick={onClose}>X</button>
        </div>
        <hr></hr>
        <h3>Karttatietojen selitykset</h3>
        <div className="info-content">
          <table style={{textAlign : 'left'}}>
            <tbody>
              <tr>
                <td style={{fontWeight : 'bold', minWidth: '90px'}}><b>Heisala</b></td>
                <td>Saari, luoto, kari, paikka tai maakohde</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', color: 'blue' }}><b>Bölsviken</b></td>
                <td>Vesikohde- tai alue</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', color: 'blue' }}>- - - -</td>
                <td>6 metrin syvyyskäyrä</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', color: 'blue' }}>. . . . .</td>
                <td>3 metrin syvyyskäyrä</td>
              </tr>
              <tr>
                <td>24.5</td>
                <td>Yksittäiset syvyysluvut</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold'}}>7.5</td>
                <td>Väyläalueen syvyysluku</td>
              </tr>
              <tr>
                <td>+</td>
                <td>Vesikivi</td>
              </tr>
              <tr>
                <td>----</td>
                <td>Väylä - valaistu</td>
              </tr>
              <tr>
                <td style={{color: 'gray'}}>---- <em style={{color: 'black'}}>(valk.)</em></td>
                <td>Väylä - ei valaistu</td>
              </tr>
              <tr>
                <td><span style={{backgroundColor: 'green' }}>----</span> <em>(vihr.)</em></td>
                <td>Veneilyn runkoväylä</td>
              </tr>
              <tr>
                <td>
                    <img src={`${process.env.PUBLIC_URL}/src/icons/merkit/pohjois-poiju.png`} alt="poiju"/>
                    <img src={`${process.env.PUBLIC_URL}/src/icons/merkit/vasen-poiju.png`} alt="poiju"/>
                    <img src={`${process.env.PUBLIC_URL}/src/icons/merkit/kari-poiju.png`} alt="poiju"/>
                    <img src={`${process.env.PUBLIC_URL}/src/icons/merkit/linjamerkki.png`} alt="poiju"/>
                    <img src={`${process.env.PUBLIC_URL}/src/icons/merkit/tutkamerkki.png`} alt="poiju"/>
                </td>
                <td>Viittojen karttamerkit</td>
              </tr>
              <tr>
                <td>
                    <img src={`${process.env.PUBLIC_URL}/src/icons/paivamerkit/pohjois-poiju.png`} alt="poiju"/>
                    <img src={`${process.env.PUBLIC_URL}/src/icons/paivamerkit/vasen-poiju.png`} alt="poiju"/>
                    <img src={`${process.env.PUBLIC_URL}/src/icons/paivamerkit/kari-poiju.png`} alt="poiju"/>
                    <img src={`${process.env.PUBLIC_URL}/src/icons/paivamerkit/suuntaloisto.png`} alt="poiju"/>
                    <img src={`${process.env.PUBLIC_URL}/src/icons/paivamerkit/tutkamerkki.png`} alt="poiju"/>
                </td>
                <td>Viittojen päivämerkit (väritunnukset)</td>
              </tr>
              <tr>
                <td>
                    <img src={`${process.env.PUBLIC_URL}/src/icons/anchor.png`} alt="ankkuri"/>
                </td>
                <td>Ankkuripaikka</td>
              </tr>
              <tr>
                <td>
                    <img src={`${process.env.PUBLIC_URL}/src/icons/vessels/Tankkeri.png`} alt="Tankkeri"/>
                </td>
                <td>Tankkeri, rahtialus tai muu alus</td>
              </tr>
              <tr>
                <td>
                    <img src={`${process.env.PUBLIC_URL}/src/icons/vessels/Hinaaja.png`} alt="Hinaaja"/>
                </td>
                <td>Hinaaja</td>
              </tr>
              <tr>
                <td>
                    <img src={`${process.env.PUBLIC_URL}/src/icons/vessels/Ruoppaus.png`} alt="Ruoppaus"/>
                </td>
                <td>Ruoppaus</td>
              </tr>
              <tr>
                <td>
                    <img src={`${process.env.PUBLIC_URL}/src/icons/vessels/Sukellustoiminta.png`} alt="Sukellustoiminta"/>
                </td>
                <td>Sukellustoiminta</td>
              </tr>
              <tr>
                <td>
                    <img src={`${process.env.PUBLIC_URL}/src/icons/vessels/Sota-alus.png`} alt="Sota-alus"/>
                </td>
                <td>Sota-alus</td>
              </tr>
              <tr>
                <td>
                    <img src={`${process.env.PUBLIC_URL}/src/icons/vessels/Purjealus.png`} alt="Purjealus"/>
                </td>
                <td>Purjealus</td>
              </tr>
              <tr>
                <td>
                    <img src={`${process.env.PUBLIC_URL}/src/icons/vessels/Huvialus.png`} alt="Huvialus"/>
                </td>
                <td>Huvialus</td>
              </tr>
              <tr>
                <td>
                    <img src={`${process.env.PUBLIC_URL}/src/icons/vessels/Pika-alus.png`} alt="Pika-alus"/>
                </td>
                <td>Pika-alus</td>
              </tr>
              <tr>
                <td>
                    <img src={`${process.env.PUBLIC_URL}/src/icons/vessels/Pelastusalus.png`} alt="Pelastusalus"/>
                </td>
                <td>Pelastusalus tai Ympäristövahinkojen torjunta</td>
              </tr>
              <tr>
                <td>
                    <img src={`${process.env.PUBLIC_URL}/src/icons/vessels/Luotsi.png`} alt="Luotsi"/>
                </td>
                <td>Luotsi</td>
              </tr>
              <tr>
                <td>
                    <img src={`${process.env.PUBLIC_URL}/src/icons/vessels/Matkustajalaiva.png`} alt="Matkustajalaiva"/>
                </td>
                <td>Matkustajalaiva tai 'Ei tietoa'</td>
              </tr>
              <tr>
                <td>
                    <img src={`${process.env.PUBLIC_URL}/src/icons/vessels/Yhteysalus.png`} alt="Yhteysalus"/>
                </td>
                <td>Yhteysalus</td>
              </tr>
              <tr>
                <td>
                    <img src={`${process.env.PUBLIC_URL}/src/icons/vessels/Viranomainen.png`} alt="Viranomainen"/>
                </td>
                <td>Viranomainen</td>
              </tr>
              <tr>
                <td>..</td>
                <td>..</td>
              </tr>
              <tr>
                <td>..</td>
                <td>..</td>
              </tr>
              <tr>
                <td>..</td>
                <td>..</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default MapInformation;
