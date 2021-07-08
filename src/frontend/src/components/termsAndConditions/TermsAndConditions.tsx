import cx from 'classnames';

import styles from "./TermsAndConditions.module.css";

export type Props = {
  className?: string;
};

export default ({ className }: Props) => (
  <div className={cx(styles.root, className)}>
    <h2>
      <b>pi-topOS End User Licence Agreement (EULA)</b>
    </h2>
    <p>
      PLEASE READ THIS END USER LICENSE AGREEMENT (“AGREEMENT”). BY DOWNLOADING
      OR INSTALLING CEED LTD SOFTWARE (“SOFTWARE”), OR BY USING CEED LTD
      EQUIPMENT THAT CONTAINS THE SOFTWARE (“EQUIPMENT”), YOU AND ANY ENTITY YOU
      REPRESENT (“CUSTOMER”) AGREE TO BE BOUND BY THIS AGREEMENT WITH CEED LTD
      (“CEED LTD”). IF CUSTOMER DOES NOT AGREE TO ALL OF THE TERMS OF THIS
      AGREEMENT, THEN DO NOT DOWNLOAD, INSTALL OR USE THE SOFTWARE.
    </p>
    <p>
      <i>
        The following terms govern Customer’s use of any Software except to the
        extent particular Software (a) is the subject of a separate written
        agreement between Customer and CEED Ltd; or (b) includes or references a
        separate license agreement. Customer’s license to the Software is
        subject to any terms and conditions contained in this agreement,
        including, without limitation, the term of the license (“License Term”),
        applicable devices or types of devices (“Applicable Devices”) and
        limitations with respect to use on a single hardware device, number of
        devices under management, number of ports or other quantitative limits
        (“Quantitative Limits”) . The Software provided or made available to
        Customer may include features or functionality that Customer may not use
        unless Customer purchases a separate license to such features and
        functionality.
      </i>
    </p>
    <p>
      <b>Limited License Grant.</b> With respect to the specific program
      modules, feature set(s) or feature(s) of the Software, and subject to
      Customer’s compliance with the Limitations and Restrictions section of
      this Agreement, CEED Ltd grants to Customer a limited, revocable,
      nonexclusive, nonsublicensable and nontransferable license, during the
      License Term to:{" "}
    </p>
    <p>
      (1) download, install and use such Software consistent with the use and
      restrictions set forth in this Agreement and only for Customer’s internal
      business purposes;
    </p>
    <p>
      (2) reproduce, copy, modify, and create derivative works of any such
      Software that is provided in source code format, only for Customer’s
      internal business purposes; provided, however, that if any Software is
      provided in source code format, Customer shall not create any derivative
      works of the Software that contain Open Source Software nor shall Customer
      use the Software or portion thereof to merge with, link to, make function
      calls to, or share data structures with any Open Source Software, if any
      such combination or use of the Software would require the Software to be
      made available royalty free or in source code form;{" "}
    </p>
    <p>
      (3) use the Software in conjunction with Third Party Software in a manner
      consistent with the terms of this Agreement.
    </p>
    <p>
      As used in this Agreement, “Open Source Software” means any software made
      available by a third party under a license approved by the Open Source
      Initiative, or any substantially similar license.
    </p>
    <p>
      <b>Limitations and Restrictions.</b> Except as otherwise expressly
      provided in this Agreement, the foregoing license grant excludes any right
      to, and Customer shall not: (1) sell, transfer, assign or sublicense the
      Software or Customer’s license rights under this Agreement, whether
      voluntarily or by operation of law, to any third party, directly or
      indirectly, and any such attempted transfer, assignment or sublicense
      shall be void; (2) use or allow use of the Software on any hardware other
      than the Applicable Devices; (3) modify, reproduce, decompile, decrypt,
      disassemble, reverse engineer, create derivative works of or otherwise
      reduce to human-readable form any Software (other than Software that is
      provided in source code format); gain access to trade secrets or
      confidential information in the Software; circumvent any copy-protection
      or license enforcement; or attempt to do any of the foregoing, except to
      the extent expressly permitted by applicable law; (4) combine, commingle,
      or integrate any Software with Open Source Software or incorporate Open
      Source Software into any Software that may add any additional Open Source
      Software requirements, obligations, or licensing terms to the Software;
      (5) disclose to any third party any results of benchmarking or other
      testing generated in connection with Customer’s use of Software, including
      without limitation any comparisons of the Software with any other
      products; (6) provide a third party with a copy of or access to the
      Software (including, without limitation, source code) (if Customer does
      so, Customer will be responsible to CEED Ltd for all acts of such third
      party); (7) remove from the Software (or fail to include in any copy) any
      readme files, notices, headers, disclaimers, marks or labels; and (8) use
      or allow use of the Software in violation of any applicable law or
      regulation or to support or facilitate any illegal activity. Customer
      shall be liable to CEED Ltd for any damages, injury or harm caused to CEED
      Ltd as a result of Customer’s violation of any of these limitations or
      restrictions.
    </p>
    <p>
      <b>Applicable Devices.</b> The Applicable Devices on which the Software is
      licensed to run are the pi-top and pi-topCEED hardware platforms.{" "}
    </p>
    <p>
      <b>Quantitative Limits. </b> The applicable Quantitative Limits is one
      Applicable Device, i.e. a single hardware device.{" "}
    </p>
    <p>
      <b>Updates.</b> The terms and conditions of this Agreement shall apply to
      any upgrades, updates, bug fixes or modified versions (collectively,
      “Updates”) or additional copies of the Software. Notwithstanding any other
      provision of this Agreement: (1) Customer has no license or right to use
      any such Updates or additional copies unless Customer, at the time of
      acquiring them, already holds a valid license to the Software associated
      with such Updates; and (2) use of additional copies of the Software is
      limited to backup purposes only. By downloading or using any Updates,
      Customer’s rights with respect to the Updates are subject to the terms of
      the latest revision of this Agreement posted at the time of receipt of the
      Updates, CEED Ltd’s then-current policies and procedures, and Customer’s
      Proof of Entitlement for the Software associated with such Updates.
    </p>
    <p>
      <b>Proprietary Notices.</b> Customer agrees to maintain and reproduce all
      copyright and other proprietary notices on all copies, in any form, of the
      Software in the same form and manner that such copyright and other
      proprietary notices are included on the Software. Except as expressly
      authorized in this Agreement, Customer may make such backup copies of the
      Software as may be necessary for Customer’s lawful use, provided Customer
      affixes to such copies all copyright, confidentiality, and proprietary
      notices that appear on the original.
    </p>
    <p>
      <b>Reservation of Rights.</b> The Software and documentation are owned by
      CEED Ltd and its licensors, and is protected by copyright, patent,
      trademark, and trade secret laws of the United States and other
      jurisdictions, international conventions, and all other relevant
      intellectual property and proprietary rights, and applicable laws. As
      between Customer and CEED Ltd, the Software, including without limitation
      intellectual property rights therein and thereto, are the sole and
      exclusive property of CEED Ltd or its subsidiaries or affiliated companies
      and/or its third-party licensors. All Software is licensed to Customer,
      not sold. CEED Ltd reserves all rights not expressly granted in this
      Agreement, and no rights or licenses shall be deemed or interpreted to be
      granted or transferred hereunder, whether by implication, estoppel, or
      otherwise.
    </p>
    <p>
      <b>Taxes.</b> CEED Ltd will not be responsible for any taxes or other
      amount assessed to Customer by any government agency based on Customer’s
      net income, gross revenue, or for any other reason.
    </p>
    <p>
      <b>Third Party Software.</b> The Software may be distributed alongside
      certain third party software (“Third Party Software”) only where provided
      under separate license terms (the “Third Party Terms”). Notwithstanding
      licenses granted in this Agreement, Customer acknowledges that certain
      components of the Software may be covered by Open Source Software licenses
      of third parties (“Open Source Components”). To the extent required by the
      open source licenses applicable to the Open Source Components, the terms
      of such licenses will apply to such Open Source Components in lieu of the
      terms of this Agreement. To the extent the terms of the open source
      licenses applicable to an Open Source Component prohibit any of the
      restrictions in this Agreement with respect to such Open Source Component,
      such restrictions will not apply to such Open Source Component. To the
      extent the terms of the open source licenses applicable to the Open Source
      Components require CEED Ltd to make an offer to provide source code or
      related information in connection with Open Source Components, such offer
      is hereby made.{" "}
    </p>
    <p>
      <b>Protection of Information.</b> Customer agrees that the Software and
      associated documentation, including, without limitation, the specific
      design and structure of individual programs, constitute trade secrets
      and/or copyrighted material of CEED Ltd. Customer shall not disclose,
      provide, or otherwise make available such trade secrets or copyrighted
      material in any form to any third party without the prior written consent
      of CEED Ltd. Customer shall implement reasonable security measures to
      protect such trade secrets and copyrighted material.
    </p>
    <p>
      <b>Commercial Item.</b> The Software and associated documentation are
      “commercial items” as defined at FAR 2.101 comprised of “commercial
      computer software” and “commercial computer software documentation” as
      those terms are used in FAR 12.212. Consequently, regardless of whether
      Customer is United States Government or a department or agency thereof,
      Customer shall acquire only those rights with respect to the Software and
      associated documentation that are set forth in this Agreement.
    </p>
    <p>
      <b>
        <i>Term and Termination</i>.
      </b>{" "}
      This Agreement is effective until terminated. Customer may terminate this
      Agreement at any time by destroying all copies of Software including,
      without limitation, any documentation. Customer’s license rights under
      this Agreement will terminate immediately without notice from CEED Ltd if
      Customer fails to comply with any provision of this Agreement. The license
      for the Software is “Perpetual” and the License Term applicable to the
      Software is perpetual, subject only to any breach of this Agreement. Upon
      termination or expiration of this Agreement for any reason, (a) Customer
      shall immediately cease using any Software and must destroy or return to
      CEED Ltd all copies of the Software and associated documentation in its
      possession or control; and (b) Customer shall promptly pay to CEED Ltd any
      amounts owed under this Agreement.
    </p>
    <p>
      <b>Limited Software Warranty and Disclaimers.</b> Subject to the terms and
      conditions of this Agreement CEED Ltd warrants for a period of 90 days
      from the Start Date that (i) the media on which the Software is delivered
      will be free of defects in material and workmanship under normal
      authorized use consistent with the product instructions and (ii) the
      Software will perform substantially in accordance with CEED Ltd’s standard
      specifications. The sole and exclusive remedy of the Customer and the
      entire liability of CEED Ltd under this limited software warranty shall be
      for CEED Ltd to replace the defective media. This limited warranty extends
      only to the original purchaser. The “Start Date” shall mean the date when
      the Customer is granted access to the Software. NOTWITHSTANDING THE
      FOREGOING, ANY SOFTWARE LICENSED UNDER AN EVALUATION LICENSE, ANY SOFTWARE
      THAT IS PROVIDED WITHOUT CHARGING ANY FEE, ANY MODIFIED SOFTWARE AND ANY
      THIRD PARTY SOFTWARE ARE FURNISHED “AS IS,” WITH ALL FAULTS AND WITHOUT
      WARRANTY OF ANY KIND WHATSOEVER, EXPRESS OR IMPLIED. CEED LTD DISCLAIMS
      ANY WARRANTY, REPRESENTATION OR ASSURANCE THAT THE SOFTWARE, OR ANY
      EQUIPMENT OR NETWORK RUNNING THE SOFTWARE, WILL OPERATE WITHOUT ERROR OR
      INTERRUPTION, OR WILL BE FREE OF VULNERABILITY TO INTRUSION OR ATTACK.
      CUSTOMER MAY NOT MAKE A WARRANTY CLAIM AFTER EXPIRATION OF THE 90-DAY
      WARRANTY PERIOD.
    </p>
    <p>
      No warranty will apply if the CEED Ltd product or Software (i) has been
      altered, except by CEED Ltd; (ii) has not been installed, operated,
      repaired, or maintained in accordance with instructions supplied by CEED
      Ltd in the applicable documentation; or (iii) has been subjected to
      unreasonable physical, thermal or electrical stress, misuse, negligence,
      or accident. In addition, the CEED Ltd products and Software are not
      designed or intended for use in (i) the design, construction, operation or
      maintenance of any nuclear facility; (ii) navigating or operating
      aircraft; or (iii) any life-saving, life-support or life-critical medical
      equipment, and CEED Ltd disclaims any express or implied warranty of
      fitness for such uses. Customer is solely responsible for assessing the
      suitability of the CEED Ltd products and Software for use in particular
      applications and for backing up its programs and data to protect against
      loss or corruption. CEED Ltd’s warranty obligations do not include
      installation support.
    </p>
    <p>
      EXCEPT AS SPECIFIED IN THE LIMITED SOFTWARE WARRANTY SET FORTH IN THIS
      AGREEMENT, ALL EXPRESS OR IMPLIED REPRESENTATIONS AND WARRANTIES,
      INCLUDING, WITHOUT LIMITATION, ANY IMPLIED WARRANTY OF MERCHANTABILITY,
      FITNESS FOR A PARTICULAR PURPOSE OR MEETING CUSTOMER’S REQUIREMENTS,
      NONINFRINGEMENT OF ANY THIRD PARTY’S INTELLECTUAL PROPERTY RIGHTS,
      COMPATIBILITY OR INTEROPERABILITY WITH ANY HARDWARE, SOFTWARE, SYSTEMS OR
      DATA NOT PROVIDED BY CEED LTD, SATISFACTORY QUALITY, OR FREEDOM FROM
      INTERRUPTION OR ERROR, ARE HEREBY DISCLAIMED AND EXCLUDED TO THE MAXIMUM
      EXTENT PERMITTED BY APPLICABLE LAW. TO THE EXTENT AN IMPLIED WARRANTY
      CANNOT BE EXCLUDED, SUCH WARRANTY IS LIMITED IN DURATION TO THE 90-DAY
      WARRANTY PERIOD OR OTHERWISE TO THE MAXIMUM EXTENT PERMITTED BY LAW.
      BECAUSE SOME STATES OR JURISDICTIONS DO NOT ALLOW LIMITATIONS ON HOW LONG
      AN IMPLIED WARRANTY LASTS, THE ABOVE LIMITATION MAY NOT APPLY TO CUSTOMER.
    </p>
    <p>
      THIS WARRANTY GIVES CUSTOMER SPECIFIC LEGAL RIGHTS, AND CUSTOMER MAY ALSO
      HAVE OTHER RIGHTS, WHICH VARY FROM JURISDICTION TO JURISDICTION.
    </p>
    <p>
      <b>
        <i>Disclaimer of Liabilities</i>.
      </b>{" "}
      IN NO EVENT WILL CEED LTD OR ITS DIRECTORS, OFFICERS, EMPLOYEES,
      AFFILIATES, SUPPLIERS OR LICENSORS BE LIABLE FOR ANY LOST REVENUE OR
      PROFIT, LOSS OF DATA, COSTS OF PROCUREMENT OF SUBSTITUTE GOODS, OR FOR
      SPECIAL, INDIRECT, CONSEQUENTIAL, INCIDENTAL, OR PUNITIVE DAMAGES, HOWEVER
      CAUSED AND REGARDLESS OF THE THEORY OF LIABILITY, ARISING OUT OF OR
      RELATED TO THIS AGREEMENT OR THE USE OF OR INABILITY TO USE THE SOFTWARE,
      EVEN IF CEED LTD OR ITS DIRECTORS, OFFICERS, EMPLOYEES, AFFILIATES,
      SUPPLIERS OR LICENSORS HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH
      DAMAGES. IN NO EVENT SHALL THE CUMULATIVE LIABILITY OF CEED LTD, ITS
      DIRECTORS, OFFICERS, EMPLOYEES, AFFILIATES, SUPPLIERS OR LICENSORS TO
      CUSTOMER, WHETHER IN CONTRACT, TORT (INCLUDING, WITHOUT LIMITATION,
      NEGLIGENCE), OR OTHERWISE, EXCEED THE AMOUNTS ACTUALLY PAID TO CEED LTD BY
      CUSTOMER FOR THE SOFTWARE OR EQUIPMENT THAT IS THE SUBJECT OF SUCH CLAIM
      IN THE 12-MONTH PERIOD IMMEDIATELY PRECEDING THE DATE WHEN NOTICE OF SUCH
      CLAIM WAS PROVIDED HEREUNDER. THE FOREGOING LIMITATIONS SHALL APPLY EVEN
      IF THE ABOVE-STATED WARRANTY FAILS OF ITS ESSENTIAL PURPOSE. BECAUSE SOME
      STATES OR JURISDICTIONS DO NOT ALLOW LIMITATION OR EXCLUSION OF
      CONSEQUENTIAL OR INCIDENTAL DAMAGES, THE ABOVE LIMITATION MAY NOT APPLY TO
      CUSTOMER. IN SUCH A CASE THE FOREGOING LIMITATION WILL BE APPLIED TO THE
      GREATEST EXTENT PERMISSIBLE PURSUANT TO APPLICABLE LAW.
    </p>
    <p>
      <b>Indemnification.</b> Customer shall defend, indemnify, and hold CEED
      Ltd, its affiliates, directors, employees, and representatives harmless
      against any liabilities, losses, damages, claims, demands, fees, expenses
      and other costs of any kind or nature, including, without limitation, any
      attorney fees, expert fees, filing fees, judgments, and settlement amounts
      associated therewith, as and when incurred, arising out of or related to
      Customer’s use of the Software or any breach or alleged breach by Customer
      or any of Customer’s employees, representatives or agents of any
      obligation, representation or warranty contained in this Agreement.
    </p>
    <p>
      <b>Export and Compliance with Laws.</b> Customer shall comply with all
      applicable laws and regulations in connection with its use of the
      Software, as well as related technical information and data. Customer
      acknowledges that the Software may contain encryption or encryption
      technology and may be subject to certain controls and restrictions under
      U.S. and non-U.S. export, re-export and other laws, regulations and
      restrictions (collectively, the “Export Regulations”), including, without
      limitation, the U.S. Export Administration Act of 1979, as amended from
      time to time, and regulations promulgated thereunder, U.S. trade sanction
      programs, and other regulations promulgated by the Office of Foreign
      Assets Control, the Department of Commerce or other departments of the
      U.S. government. Customer agrees that it is solely responsible for
      obtaining and will obtain any necessary approvals or licenses from the
      applicable U.S. and foreign regulatory authorities. Without limiting the
      generality of the foregoing, Customer represents and warrants to CEED Ltd
      that it will not, directly or indirectly, export or re-export, supply or
      otherwise make available the Software or any related technical information
      or data to any person in violation of any Export Regulation, including,
      without limitation, re-exporting, supplying or otherwise making available
      the Software to any person on the U.S. Department of Commerce’s Denied
      Persons List or affiliated lists, on the U.S. Department of Treasury’s
      Specially Designated Nationals List, in a country on the State Sponsors of
      Terrorism list or on any U.S. export exclusion lists (collectively, the
      “Export Denial Lists”). Customer represents and warrants that it is not on
      any of the Export Denial Lists and that Customer is not using and will not
      use any Software or related technical information or data to further
      activities in support of development, manufacture or use of nuclear fuel
      or weapons, missiles, or chemical or biological weapons. Customer further
      certifies to CEED Ltd that Customer will immediately notify CEED Ltd if at
      any time those warranties and representation become no longer accurate.
    </p>
    <p>
      <b>Trust-Based Licensing Model.</b> Certain Software licensed under this
      Agreement does not include programmatic license enforcement. It is
      Customer’s responsibility to ensure compliance with this Agreement,
      including, without limitation, all applicable restrictions set forth
      herein. By adopting this trust-based licensing model, CEED Ltd does not
      waive its right to enforce any aspect of this Agreement at any time.
      Additionally, CEED Ltd’s knowledge of Customer’s use of the Software
      beyond the scope of the license shall not operate as a waiver of CEED
      Ltd’s rights to enforce the terms of this Agreement under any legal or
      equitable doctrine.
    </p>
    <p>
      <b>Customer Software Use Reporting.</b> Customer agrees to monitor its use
      of the Software and generate accurate records of its level of use. If at
      any time Customer becomes aware that it has used any Software in a manner
      that does not conform with the terms of this Agreement, Customer shall
      promptly notify CEED Ltd in writing of such use.
    </p>
    <p>
      <b>Survival.</b> The license limitations and restrictions contained in the
      section entitled “Limitations and Restrictions” as well as the following
      provisions shall survive the termination or expiration of this Agreement:
      Reservation of Rights, Protection of Information, Term and Termination,
      Limited Software Warranty and Disclaimers, Disclaimer of Liabilities,
      Indemnification, Customer Software Use Reporting, and General Provisions.
    </p>
    <p>
      <b>General Provisions.</b> This Agreement shall be governed by and
      interpreted in accordance with the laws of England and Wales, UK, without
      regard to conflict of laws provisions thereof. Neither the provisions of
      the United Nations Convention on Contracts for the International Sale of
      Goods nor those of the Uniform Computer Information Transactions Act shall
      apply. Disputes arising hereunder shall be subject to the exclusive
      jurisdiction of the courts of England and Wales, and the parties agree to
      submit to the jurisdiction of such courts. CEED Ltd may assign this
      Agreement or delegate its responsibilities without restriction. Customer
      may not assign this Agreement, its rights or licenses, or delegate its
      duties, hereunder, nor may any successor entity of Customer assume such
      rights, licenses or duties, in whole or in part, directly or indirectly,
      whether by sale of stock or assets, merger, change of control, operation
      of law, or otherwise, without CEED Ltd’s prior written consent. Any
      assignment or assumption in violation of the foregoing shall be void and
      of no effect. Subject to the foregoing, this Agreement shall bind and
      inure to the benefit of the parties and their respective permitted
      successors and assigns. This Agreement is the entire agreement between
      CEED Ltd and Customer with respect to the Software, and supersedes any and
      all prior agreements, negotiations, or other communications between CEED
      Ltd and Customer, whether oral or written, with respect to the subject
      matter hereof. In the event that any provision of this Agreement is held
      to be invalid or unenforceable, then: (a) such provision shall be deemed
      to be reformed to the extent strictly necessary to render such provision
      valid and enforceable, or if not capable of such reformation shall be
      deemed to be severed from this Agreement; and (b) the validity and
      enforceability of all of the other provisions hereof, shall in no way be
      affected or impaired thereby. CEED Ltd’s failure to exercise, or delay in
      exercising, a right, power or remedy provided in this Agreement or by law
      shall not constitute a waiver of that right, power or remedy. CEED Ltd’s
      waiver of any obligation or breach of this Agreement shall not operate as
      a waiver of any other obligation or subsequent breach of the Agreement.
      The English language version of this Agreement shall be the official and
      controlling version, and any translation provided is solely for
      convenience.
    </p>
  </div>
);
